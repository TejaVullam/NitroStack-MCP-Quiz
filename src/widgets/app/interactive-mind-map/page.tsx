'use client';
import { useWidgetSDK } from '@nitrostack/widgets';
type Branch = { label:string; children:string[] };
type MapData = { central:string; branches:Branch[] };
export default function InteractiveMindMap() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = (isReady ? getToolOutput<MapData>() : null) as MapData | null;
  if (!isReady || !data?.branches?.length) return <main className="panel"><div className="card">Building your mind map…</div></main>;
  const width=900, centerX=450, centerY=330, branchRadius=180, childRadius=300;
  const positions = data.branches.map((branch,i)=>{
    const angle=(-Math.PI/2)+(2*Math.PI*i/data.branches.length);
    const bx=centerX+Math.cos(angle)*branchRadius, by=centerY+Math.sin(angle)*branchRadius;
    return {branch,bx,by,angle,children:branch.children.map((label,j)=>{
      const spread=Math.min(0.9,0.28+branch.children.length*0.12);
      const a=angle+(j-(branch.children.length-1)/2)*spread;
      return {label,x:centerX+Math.cos(a)*childRadius,y:centerY+Math.sin(a)*childRadius};
    })};
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="660" viewBox="0 0 900 660"><rect width="100%" height="100%" rx="20" fill="#10111a"/>${positions.map(p=>`<line x1="${centerX}" y1="${centerY}" x2="${p.bx}" y2="${p.by}" stroke="#8b80ff" stroke-width="3"/>${p.children.map(c=>`<line x1="${p.bx}" y1="${p.by}" x2="${c.x}" y2="${c.y}" stroke="#555b7c" stroke-width="2"/>`).join('')}`).join('')}<circle cx="${centerX}" cy="${centerY}" r="72" fill="#6558e8"/> <text x="${centerX}" y="${centerY}" fill="white" font-size="17" text-anchor="middle" dominant-baseline="middle">${escapeXml(data.central.slice(0,28))}</text>${positions.map(p=>`<rect x="${p.bx-65}" y="${p.by-27}" width="130" height="54" rx="12" fill="#282943" stroke="#8b80ff"/><text x="${p.bx}" y="${p.by}" fill="white" font-size="13" text-anchor="middle" dominant-baseline="middle">${escapeXml(p.branch.label.slice(0,20))}</text>${p.children.map(c=>`<rect x="${c.x-57}" y="${c.y-20}" width="114" height="40" rx="9" fill="#1d2937" stroke="#536985"/><text x="${c.x}" y="${c.y}" fill="#e4e8f4" font-size="11" text-anchor="middle" dominant-baseline="middle">${escapeXml(c.label.slice(0,18))}</text>`).join('')}`).join('')}</svg>`;
  function escapeXml(s:string){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c] as string));}
  const encoded='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  return <main className="panel"><div className="card"><h1>{data.central}</h1><p className="muted">Explore the branches and download the map as an SVG image.</p><img src={encoded} alt={`Mind map of ${data.central}`} style={{width:'100%',borderRadius:12}}/><p><a className="button" href={encoded} download="mind-map.svg" style={{display:'inline-block',textDecoration:'none'}}>Download SVG</a></p>{data.branches.map((b,i)=><section key={i}><h2>{b.label}</h2><ul>{b.children.map((c,j)=><li key={j}>{c}</li>)}</ul></section>)}</div></main>;
}
