import { useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Building2,
  Check,
  ChevronRight,
  CircleDashed,
  FileSearch,
  FolderSearch2,
  Images,
  LayoutDashboard,
  ListFilter,
  LockKeyhole,
  PackagePlus,
  Search,
  ServerOff,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  companyReferenceFixtures,
  filterCompanyReferences,
  type CompanyReferenceFixture,
  type CompanyReferenceStatus,
} from '../data/companyPortalFixtures'

type PortalView = 'overview' | 'references' | 'guidance'

const statusMeta: Record<CompanyReferenceStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'portal-status--draft' },
  'ready-review': { label: 'Ready for review', className: 'portal-status--ready' },
  'changes-needed': { label: 'Changes needed', className: 'portal-status--changes' },
}

function ReferenceStatus({ status }: { status: CompanyReferenceStatus }) {
  const meta = statusMeta[status]
  return <span className={`portal-status ${meta.className}`}>{meta.label}</span>
}

function ReferenceDetail({ reference, onClose }: { reference: CompanyReferenceFixture; onClose: () => void }) {
  return (
    <aside className="reference-detail" aria-label="Selected reference details">
      <div className="reference-detail__header">
        <div><p className="mini-heading">Sample reference</p><h3>{reference.brand} {reference.productName}</h3></div>
        <button type="button" onClick={onClose} aria-label="Close reference details"><X aria-hidden="true" /></button>
      </div>
      <ReferenceStatus status={reference.status} />
      <dl>
        <div><dt>Reference ID</dt><dd>{reference.id}</dd></div>
        <div><dt>Category</dt><dd>{reference.category}</dd></div>
        <div><dt>Market</dt><dd>{reference.market}</dd></div>
        <div><dt>Package version</dt><dd>{reference.version}</dd></div>
        <div><dt>Package views</dt><dd>{reference.viewsReady} of {reference.viewsExpected} prepared</dd></div>
      </dl>
      <div className="reference-detail__notes"><p className="mini-heading">Preparation notes</p><ul>{reference.notes.map((note) => <li key={note}>{note}</li>)}</ul></div>
      <div className="reference-detail__boundary"><LockKeyhole aria-hidden="true" /><p>This is fictional sample data. Editing and service submission are unavailable until a company backend and authentication are connected.</p></div>
    </aside>
  )
}

export function CompanyPortalPage() {
  const [view, setView] = useState<PortalView>('overview')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<CompanyReferenceStatus | 'all'>('all')
  const [selected, setSelected] = useState<CompanyReferenceFixture | null>(null)
  const filteredReferences = useMemo(() => filterCompanyReferences(companyReferenceFixtures, query, status), [query, status])

  const changeView = (next: PortalView) => {
    setView(next)
    setSelected(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="company-portal-page">
      <div className="container portal-topbar">
        <Link className="portal-back" to="/company"><ArrowLeft size={16} aria-hidden="true" /> Company information</Link>
        <div className="portal-demo-label"><CircleDashed aria-hidden="true" /><span><strong>Sample workspace</strong> Fictional data · Backend disconnected</span></div>
      </div>

      <div className="container company-portal-shell">
        <aside className="portal-nav" aria-label="Company portal navigation">
          <div className="portal-organization">
            <span><Building2 aria-hidden="true" /></span>
            <div><strong>Demo organization</strong><small>Frontend preview</small></div>
          </div>
          <nav>
            <button className={view === 'overview' ? 'active' : ''} type="button" onClick={() => changeView('overview')}><LayoutDashboard aria-hidden="true" /> Overview</button>
            <button className={view === 'references' ? 'active' : ''} type="button" onClick={() => changeView('references')}><FolderSearch2 aria-hidden="true" /> References</button>
            <button className={view === 'guidance' ? 'active' : ''} type="button" onClick={() => changeView('guidance')}><BookOpenCheck aria-hidden="true" /> Review guidance</button>
          </nav>
          <div className="portal-service-card"><ServerOff aria-hidden="true" /><strong>Service not connected</strong><p>Sign-in, storage, review submission, and organization verification require a future backend.</p></div>
        </aside>

        <main className="portal-main">
          {view === 'overview' && (
            <div className="portal-view">
              <div className="portal-view-heading">
                <div><p className="eyebrow">Company portal</p><h1>Good evening, Demo organization.</h1><p>Here is a clear view of what would need attention before reference materials could enter review.</p></div>
                <Link className="button" to="/company"><PackagePlus size={17} aria-hidden="true" /> Prepare a reference</Link>
              </div>

              <div className="portal-alert" role="note"><CircleDashed aria-hidden="true" /><p><strong>Interface demonstration.</strong> The organization, records, dates, and statuses on this page are fictional fixtures. No company account or reference database exists yet.</p></div>

              <div className="portal-overview-grid">
                <section className="portal-panel portal-next-step">
                  <div className="portal-panel__heading"><div><p className="mini-heading">Recommended next step</p><h2>Complete the Repair Shampoo package views</h2></div><span>3 / 4 views</span></div>
                  <p>Add a clear barcode or batch-code image, then confirm whether the distributor line changes across the intended markets.</p>
                  <button type="button" onClick={() => { setSelected(companyReferenceFixtures[1]); setView('references') }}>View sample reference <ArrowRight size={15} aria-hidden="true" /></button>
                </section>

                <section className="portal-panel portal-connection">
                  <ServerOff aria-hidden="true" />
                  <div><p className="mini-heading">Connection state</p><h2>Frontend only</h2><p>Draft preparation is available locally. Account, storage, and submission actions stay disabled.</p></div>
                </section>
              </div>

              <section className="portal-panel portal-recent">
                <div className="portal-panel__heading"><div><p className="mini-heading">Sample references</p><h2>Recently prepared records</h2></div><button type="button" onClick={() => changeView('references')}>View all <ChevronRight size={15} aria-hidden="true" /></button></div>
                <div className="portal-reference-list">
                  {companyReferenceFixtures.slice(0, 3).map((reference) => (
                    <button key={reference.id} type="button" onClick={() => { setSelected(reference); setView('references') }}>
                      <span className="reference-avatar">{reference.brand.slice(0, 1)}</span>
                      <span><strong>{reference.brand} {reference.productName}</strong><small>{reference.market} · {reference.version}</small></span>
                      <ReferenceStatus status={reference.status} />
                      <ChevronRight aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </section>

              <div className="portal-overview-grid portal-overview-grid--bottom">
                <section className="portal-panel portal-checklist">
                  <p className="mini-heading">Before future submission</p><h2>Reference readiness checklist</h2>
                  <ul>
                    <li><Check aria-hidden="true" /><span><strong>Exact product identity</strong><small>Brand, name, variant, and package size</small></span></li>
                    <li><Check aria-hidden="true" /><span><strong>Market and version context</strong><small>Where and when the package is intended for sale</small></span></li>
                    <li><Images aria-hidden="true" /><span><strong>Complete image set</strong><small>Front, back, side, and code or seal detail</small></span></li>
                    <li><ShieldCheck aria-hidden="true" /><span><strong>Authorized materials</strong><small>Rights confirmation and future organization review</small></span></li>
                  </ul>
                </section>
                <section className="portal-panel portal-help">
                  <FileSearch aria-hidden="true" /><p className="mini-heading">Review guidance</p><h2>What makes a useful package reference?</h2><p>Clear provenance, an exact market and version, readable package text, and multiple unobstructed views.</p><button type="button" onClick={() => changeView('guidance')}>Read the guidance <ArrowRight size={15} aria-hidden="true" /></button>
                </section>
              </div>
            </div>
          )}

          {view === 'references' && (
            <div className="portal-view">
              <div className="portal-view-heading">
                <div><p className="eyebrow">Reference catalogue</p><h1>Prepared product references</h1><p>Search and inspect fictional records demonstrating the future company catalogue.</p></div>
                <Link className="button" to="/company"><PackagePlus size={17} aria-hidden="true" /> New reference</Link>
              </div>
              <div className="portal-alert" role="note"><CircleDashed aria-hidden="true" /><p><strong>Simulated catalogue.</strong> These fictional products are interface fixtures, not verified company submissions.</p></div>

              <div className={selected ? 'references-layout references-layout--detail' : 'references-layout'}>
                <div className="references-catalogue">
                  <div className="reference-toolbar">
                    <label><Search aria-hidden="true" /><span className="visually-hidden">Search references</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product, market, or ID" /></label>
                    <label><ListFilter aria-hidden="true" /><span className="visually-hidden">Filter by status</span><select value={status} onChange={(event) => setStatus(event.target.value as CompanyReferenceStatus | 'all')}><option value="all">All statuses</option><option value="draft">Draft</option><option value="ready-review">Ready for review</option><option value="changes-needed">Changes needed</option></select></label>
                  </div>
                  <div className="reference-result-meta"><span>{filteredReferences.length} sample record{filteredReferences.length === 1 ? '' : 's'}</span>{(query || status !== 'all') && <button aria-label="Clear reference filters" type="button" onClick={() => { setQuery(''); setStatus('all') }}>Clear filters</button>}</div>
                  {filteredReferences.length ? (
                    <div className="reference-table" role="list">
                      {filteredReferences.map((reference) => (
                        <button key={reference.id} role="listitem" className={selected?.id === reference.id ? 'reference-row reference-row--selected' : 'reference-row'} type="button" onClick={() => setSelected(reference)}>
                          <span className="reference-avatar">{reference.brand.slice(0, 1)}</span>
                          <span className="reference-row__product"><strong>{reference.brand} {reference.productName}</strong><small>{reference.id} · {reference.category}</small></span>
                          <span className="reference-row__market"><strong>{reference.market}</strong><small>{reference.version}</small></span>
                          <span className="reference-row__views"><strong>{reference.viewsReady}/{reference.viewsExpected}</strong><small>views</small></span>
                          <ReferenceStatus status={reference.status} />
                          <ChevronRight aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="reference-empty"><FolderSearch2 aria-hidden="true" /><h2>No sample references match</h2><p>Try a broader search or reset the status filter.</p><button aria-label="Reset reference filters" className="button button--outline" type="button" onClick={() => { setQuery(''); setStatus('all') }}>Clear filters</button></div>
                  )}
                </div>
                {selected && <ReferenceDetail reference={selected} onClose={() => setSelected(null)} />}
              </div>
            </div>
          )}

          {view === 'guidance' && (
            <div className="portal-view">
              <div className="portal-view-heading"><div><p className="eyebrow">Review guidance</p><h1>Prepare evidence reviewers can understand.</h1><p>A useful reference explains not only what the package looks like, but where it came from and which version it represents.</p></div></div>
              <div className="portal-alert" role="note"><AlertCircle aria-hidden="true" /><p><strong>Draft process.</strong> Final company verification, reviewer roles, and acceptance rules will be defined with the backend and research governance plan.</p></div>

              <div className="guidance-grid">
                <article><span>01</span><Building2 aria-hidden="true" /><h2>Source context</h2><p>Use the official organization name and an authorized representative. A company-domain email and official website can help a future reviewer establish context.</p></article>
                <article><span>02</span><FileSearch aria-hidden="true" /><h2>Exact package identity</h2><p>Name the market, package version, release period, variant, and size. Avoid treating a regional package as a universal reference.</p></article>
                <article><span>03</span><Images aria-hidden="true" /><h2>Readable image set</h2><p>Provide straight-on front and back views, relevant side panels, and close-ups of codes or security details without glare or cropping.</p></article>
                <article><span>04</span><ShieldCheck aria-hidden="true" /><h2>Authorized materials</h2><p>Only use images or artwork the organization may provide. Keep unrelated documents, personal information, and commercial secrets out of the upload.</p></article>
              </div>

              <section className="portal-panel review-path">
                <div><p className="mini-heading">Proposed future path</p><h2>Prepared does not mean approved</h2><p>A connected workflow should keep each stage explicit and preserve reviewer notes.</p></div>
                <ol>
                  <li><span>1</span><div><strong>Company draft</strong><small>Information and views prepared</small></div></li>
                  <li><span>2</span><div><strong>Authorization check</strong><small>Organization and representative reviewed</small></div></li>
                  <li><span>3</span><div><strong>Reference review</strong><small>Market, version, text, and images checked</small></div></li>
                  <li><span>4</span><div><strong>Controlled availability</strong><small>Accepted reference becomes eligible for comparison</small></div></li>
                </ol>
              </section>
            </div>
          )}
        </main>
      </div>
    </section>
  )
}
