"""Safely inspect tensor names and shapes in a PyTorch state_dict checkpoint.

This script intentionally blocks arbitrary pickle globals. It reads only the
minimal storage/tensor metadata needed to report architecture-relevant shapes.
"""

from __future__ import annotations

import argparse
import collections
import io
import pickle
import zipfile


class StorageReference:
    def __init__(self, kind: str, key: str, location: str, size: int) -> None:
        self.kind = kind
        self.key = key
        self.location = location
        self.size = size


class TensorReference:
    def __init__(
        self,
        storage: StorageReference,
        offset: int,
        size: tuple[int, ...],
        stride: tuple[int, ...],
        requires_grad: bool = False,
        hooks: object | None = None,
    ) -> None:
        self.storage = storage
        self.offset = offset
        self.size = tuple(size)
        self.stride = tuple(stride)
        self.requires_grad = requires_grad
        self.hooks = hooks


class RestrictedCheckpointUnpickler(pickle.Unpickler):
    """Allow only the primitives used by a plain PyTorch state_dict."""

    def find_class(self, module: str, name: str) -> object:
        allowed = {
            ("collections", "OrderedDict"): collections.OrderedDict,
            ("torch._utils", "_rebuild_tensor_v2"): TensorReference,
            ("torch", "FloatStorage"): "FloatStorage",
            ("torch", "LongStorage"): "LongStorage",
        }
        try:
            return allowed[(module, name)]
        except KeyError as error:
            raise pickle.UnpicklingError(
                f"Blocked unexpected checkpoint global: {module}.{name}"
            ) from error

    def persistent_load(self, persistent_id: tuple[object, ...]) -> StorageReference:
        tag, kind, key, location, size = persistent_id
        if tag != "storage":
            raise pickle.UnpicklingError(f"Blocked persistent id: {tag}")
        return StorageReference(str(kind), str(key), str(location), int(size))


def load_tensor_metadata(path: str) -> collections.OrderedDict[str, TensorReference]:
    with zipfile.ZipFile(path) as checkpoint:
        pickle_entries = [name for name in checkpoint.namelist() if name.endswith("/data.pkl")]
        if len(pickle_entries) != 1:
            raise ValueError("Expected exactly one data.pkl entry in the checkpoint")
        payload = checkpoint.read(pickle_entries[0])

    state = RestrictedCheckpointUnpickler(io.BytesIO(payload)).load()
    if not isinstance(state, collections.OrderedDict):
        raise ValueError("Checkpoint is not a plain OrderedDict state_dict")
    return state


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("checkpoint")
    parser.add_argument("--prefix", action="append", default=[])
    args = parser.parse_args()

    state = load_tensor_metadata(args.checkpoint)
    prefixes = tuple(args.prefix)
    print(f"Safe state_dict inspection: {len(state)} tensors")
    for name, tensor in state.items():
        if not prefixes or name.startswith(prefixes):
            print(f"{name}\t{tensor.size}")


if __name__ == "__main__":
    main()
