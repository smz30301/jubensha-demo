import {esc,money,label} from './utils.js';
export const btn=(text,action,id='',cls='',extra='')=>`<button type="button" class="${cls}" data-action="${action}" data-id="${esc(id)}" ${extra}>${esc(text)}</button>`;
export const badge=status=>`<span class="badge ${esc(status)}">${esc(label[status]||status)}</span>`;
export const empty=text=>`<div class="empty">${esc(text)}</div>`;
export const field=(title,name,type='text',value='',extra='')=>`<label>${esc(title)}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
export const select=(title,name,rows,value='',extra='')=>`<label>${esc(title)}<select name="${name}" aria-label="${esc(title)}" ${extra}>${rows.map(r=>`<option value="${esc(r[0])}" ${r[0]===value?'selected':''}>${esc(r[1])}</option>`).join('')}</select></label>`;
export const area=(title,name,value='',extra='')=>`<label class="wide">${esc(title)}<textarea name="${name}" ${extra}>${esc(value)}</textarea></label>`;
export const stats=items=>`<div class="stats">${items.map(([title,value,note])=>`<article><span>${esc(title)}</span><strong>${esc(value)}</strong><small>${esc(note||'')}</small></article>`).join('')}</div>`;
export function table(headers,rows){return rows.length?`<div class="table-wrap" tabindex="0" role="region" aria-label="${esc(headers.join('、'))}"><table role="table"><thead role="rowgroup"><tr role="row">${headers.map(h=>`<th scope="col" role="columnheader">${esc(h)}</th>`).join('')}</tr></thead><tbody role="rowgroup">${rows.map(r=>`<tr role="row">${r.map((c,i)=>`<td role="cell" data-label="${esc(headers[i]||'内容')}"><div class="cell-value">${c}</div></td>`).join('')}</tr>`).join('')}</tbody></table></div>`:empty('暂无记录');}
export const panel=(title,content,action='')=>`<section class="panel"><div class="section-head"><h2>${esc(title)}</h2>${action}</div>${content}</section>`;
export const cover=b=>`<div class="cover cover-${b.cover||0}" aria-label="${esc(b.name)}封面占位"><span>故事档案</span><strong>${esc(b.name)}</strong><small>${esc(b.type)} / ${b.players}人</small></div>`;
export const moneyCells=rows=>rows.map(r=>money(r));
