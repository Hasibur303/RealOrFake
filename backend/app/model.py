from __future__ import annotations

import torch
import torch.nn as nn
from sentence_transformers import SentenceTransformer
from torchvision import models


class MultimodalAuthenticityClassifier(nn.Module):
    """Architecture reconstructed exactly from the supplied training notebook."""

    def __init__(self, *, device: torch.device, sbert_model_name: str) -> None:
        super().__init__()

        # The checkpoint contains the full ResNet weights, so avoid downloading a
        # second pretrained copy during service startup.
        resnet = models.resnet50(weights=None)
        self.visual_extractor = nn.Sequential(*list(resnet.children())[:-1])

        self.sbert = SentenceTransformer(sbert_model_name, device=str(device))
        for parameter in self.sbert.parameters():
            parameter.requires_grad = False

        self.fusion = nn.Sequential(
            nn.Linear(2048 + 384 + 1, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(512, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 1),
        )

    def forward(
        self,
        images: torch.Tensor,
        texts: list[str] | tuple[str, ...],
        similarity_scores: torch.Tensor,
    ) -> torch.Tensor:
        visual_features = torch.flatten(self.visual_extractor(images), 1)
        with torch.no_grad():
            text_embeddings = self.sbert.encode(
                list(texts),
                convert_to_tensor=True,
                device=str(images.device),
            )
            if text_embeddings.dim() == 1:
                text_embeddings = text_embeddings.unsqueeze(0)
        similarity_features = similarity_scores.unsqueeze(1)
        fused = torch.cat((visual_features, text_embeddings, similarity_features), dim=1)
        return self.fusion(fused)
