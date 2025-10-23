import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Cookies from 'js-cookie';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  FiBriefcase,
  FiFileText,
  FiGift,
  FiTarget,
  FiFolder,
  FiMessageCircle,
} from 'react-icons/fi';
import { useSelector } from 'react-redux';

function capitalizeName(raw) {
  if (!raw) return 'User';
  return String(raw)
    .split(' ')
    .map((p) => (p.length ? p[0].toUpperCase() + p.slice(1) : ''))
    .join(' ');
}

const ICON_MAP = {
  briefcase: FiBriefcase,
  file: FiFileText,
  gift: FiGift,
  target: FiTarget,
  folder: FiFolder,
  message: FiMessageCircle,
};

export default function CanvasRenderer({ fixedChildren = [], heightHint = null, onNodeClick }) {
  const profile = useSelector((s) => s.cleansheet.profile);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const drawDebounceRef = useRef(null);

  const usernameRaw = profile?.userName || Cookies.get('atlas_username') || 'User';
  const username = capitalizeName(usernameRaw);

  useEffect(() => {
    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!svgEl || !container) return;
    const svg = d3.select(svgEl);

    const STYLE_ID = 'cs-canvas-style-v3';
    if (!container.querySelector(`#${STYLE_ID}`)) {
      const styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      styleEl.innerHTML = `
      :root{
        --canvas-font-primary: 'Questrial', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        --canvas-font-body: 'Barlow', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        --canvas-color-primary: #0066CC;
        --canvas-color-primary-dark: #004C99;
        --canvas-color-bg: #f5f5f7;
        --canvas-node-border: #e5e5e7;
        --canvas-link-default: #e5e5e7;
        --canvas-node-root-bg: #0066CC;
        --canvas-node-root-text: #ffffff;
        --canvas-node-branch-bg: #ffffff;
        --canvas-node-branch-text: #1a1a1a;
        --canvas-node-branch-border: #0066CC;
        --canvas-node-active-shadow: 0 6px 16px rgba(0, 102, 204, 0.14);
        --canvas-node-active-shadow-strong: 0 10px 28px rgba(0, 102, 204, 0.22);
      }

      .canvas-node-label{ 
        font-family: var(--canvas-font-primary); 
        pointer-events: none; 
        user-select: none; 
      }

      .canvas-link{ 
        fill: none; 
        stroke: var(--canvas-link-default); 
        stroke-width: 2; 
        stroke-linecap: round; 
      }

      .canvas-icon-fo { 
        pointer-events: none;
      }

      .canvas-icon-root svg { 
        display:block; 
        width:18px; 
        height:18px; 
      }

      .canvas-badge-text{ 
        font-family: 'Barlow', sans-serif; 
        font-weight:600; 
        font-size:12px; 
        pointer-events:none; 
        fill:#0f172a; 
      }

      .canvas-root-bg { cursor: grab; }

      .canvas-node rect {
        transition: transform 160ms ease, filter 160ms ease, stroke-width 160ms ease;
        will-change: transform, filter;
      }

      .canvas-node:hover rect {
        filter: drop-shadow(0 6px 16px rgba(0,102,204,0.14));
        transform: translateY(-2px);
      }

      .canvas-node[role="treeitem"][tabindex="-1"] rect,
      .canvas-node.root rect {
        transition: none;
      }

      .canvas-node[aria-selected="true"] rect {
        filter: drop-shadow(0 10px 28px rgba(0,102,204,0.22));
        transform: translateY(-3px);
      }

      foreignObject.canvas-icon-fo, foreignObject.canvas-icon-fo * {
        pointer-events: none;
      }
      `;
      container.appendChild(styleEl);
    }

    let currentTransform = d3.zoomIdentity;

    const zoom = d3
      .zoom()
      .scaleExtent([0.35, 3.5])
      .translateExtent([
        [-8000, -8000],
        [8000, 8000],
      ])
      .filter((event) => {
        if (!event) return false;
        if (event.type === 'wheel' || event.type === 'mousewheel' || event.type === 'touchmove') {
          return true;
        }

        if (
          event.type === 'mousedown' ||
          event.type === 'pointerdown' ||
          event.type === 'touchstart'
        ) {
          return true;
        }
        return true;
      })
      .on('zoom', (event) => {
        currentTransform = event.transform;
        svg.selectAll('g.canvas-viewport').attr('transform', currentTransform.toString());
        if (
          event.sourceEvent &&
          (event.sourceEvent.type === 'mousemove' || event.sourceEvent.type === 'pointermove')
        ) {
          svg.style('cursor', 'grabbing');
        } else {
          svg.style('cursor', 'grab');
        }
      });

    svg.on('dblclick.zoom', null);

    function draw() {
      svg.selectAll('*').remove();

      const rect = container.getBoundingClientRect();
      const width = Math.max(900, Math.round(rect.width || window.innerWidth));
      const height = Math.max(
        500,
        Math.round(rect.height || heightHint || window.innerHeight * 0.72),
      );
      svg.attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMinYMin meet');

      svg
        .append('rect')
        .attr('class', 'canvas-root-bg')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#ffffff')
        .style('pointer-events', 'all');

      const g = svg.append('g').attr('class', 'canvas-viewport');

      const leftPadding = 120;
      let rootW = 180;
      let rootH = 60;
      const branchW = 250;
      const branchH = 60;
      const verticalSpacing = 26;
      const cy = height / 2;

      const measureG = g
        .append('g')
        .attr('class', 'measure-root')
        .attr('transform', `translate(0,0)`)
        .style('visibility', 'hidden');

      const measureText = measureG
        .append('text')
        .attr('class', 'canvas-node-label')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .style('font-size', '18px')
        .style('font-weight', 700)
        .text(`${username}'s Canvas`);

      try {
        const bbox = measureText.node().getBBox();
        const padX = 28;
        const padY = 16;
        rootW = Math.max(180, bbox.width + padX * 2);
        rootH = Math.max(60, bbox.height + padY * 2);
      } catch (err) {
        rootW = 180;
        rootH = 60;
      }
      measureG.remove();

      const root = { id: 'root', name: `${username}'s Canvas`, root: true };
      root.x = leftPadding + rootW / 2;
      root.y = cy;
      root.width = rootW;
      root.height = rootH;

      const children = (fixedChildren || []).map((c) => ({ ...c, root: false }));
      const totalChildHeight =
        children.length * branchH + Math.max(0, children.length - 1) * verticalSpacing;
      const startY = cy - totalChildHeight / 2 + branchH / 2;

      children.forEach((child, i) => {
        const gap = 260;
        child.x = root.x + root.width / 2 + gap + branchW / 2 - rootW / 2;
        child.y = startY + i * (branchH + verticalSpacing);
      });

      const links = children.map((c) => ({
        source: { x: root.x + root.width / 2, y: root.y },
        target: { x: c.x - branchW / 2, y: c.y },
      }));

      g.append('g')
        .attr('class', 'links')
        .selectAll('path')
        .data(links)
        .join('path')
        .attr('class', 'canvas-link')
        .attr('d', (d) => {
          const x1 = d.source.x;
          const y1 = d.source.y;
          const x2 = d.target.x;
          const y2 = d.target.y;
          const dx = Math.max(80, (x2 - x1) * 0.45);
          return `M ${x1} ${y1} C ${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
        })
        .style('stroke', '#0066CC');

      const nodeG = g.append('g').attr('class', 'nodes');
      const nodes = [root, ...children];

      nodeG
        .selectAll('g.canvas-node')
        .data(nodes, (d) => d.id)
        .join((enter) => {
          const ng = enter
            .append('g')
            .attr('class', (d) => `canvas-node${d.root ? ' root' : ''}`)
            .attr('transform', (d) => `translate(${d.x},${d.y})`)
            .style('cursor', 'grab')
            .style('pointer-events', 'all');

          ng.append('rect')
            .attr('x', (d) => (d.root ? -d.width / 2 : -branchW / 2))
            .attr('y', (d) => (d.root ? -d.height / 2 : -branchH / 2))
            .attr('width', (d) => (d.root ? d.width : branchW))
            .attr('height', (d) => (d.root ? d.height : branchH))
            .attr('rx', (d) => (d.root ? 12 : 10))
            .attr('ry', (d) => (d.root ? 12 : 10))
            .style('fill', (d) => (d.root ? '#0066CC' : '#ffffff'))
            .style('stroke', (d) => (d.root ? '#004C99' : '#e6eefc'))
            .style('stroke-width', 2);

          ng.filter((d) => !d.root).each(function (d) {
            if (!d.icon) return;
            const iconComp = ICON_MAP[d.icon];
            if (!iconComp) return;
            const svgMarkup = renderToStaticMarkup(
              iconComp({ size: 18, color: '#0066CC', 'aria-hidden': true, strokeWidth: 1.6 }),
            );

            d3.select(this)
              .append('foreignObject')
              .attr('class', 'canvas-icon-fo')
              .attr('width', 28)
              .attr('height', 28)
              .attr('x', -branchW / 2 + 12)
              .attr('y', -14)
              .append('xhtml:div')
              .attr('class', 'canvas-icon-root')
              .style('white-space', 'normal')
              .style('display', 'flex')
              .style('align-items', 'center')
              .style('justify-content', 'center')
              .style('width', '28px')
              .style('height', '28px')
              .style('pointer-events', 'none')
              .html(svgMarkup);
          });

          ng.each(function (d) {
            const node = d3.select(this);
            node
              .append('text')
              .attr('class', 'canvas-node-label')
              .attr('x', (d) => (d.root ? 0 : d.icon ? -branchW / 2 + 44 : 0))
              .attr('y', 0)
              .attr('dy', '0.35em')
              .style('font-size', (d) => (d.root ? '18px' : '16px'))
              .style('font-weight', (d) => (d.root ? 700 : 600))
              .style('fill', (d) => (d.root ? '#fff' : '#1a1a1a'))
              .attr('text-anchor', (d) => (d.root ? 'middle' : d.icon ? 'start' : 'middle'))
              .text(d.name);
          });

          ng.filter((d) => !d.root)
            .append('g')
            .attr('transform', `translate(${branchW / 2 - 18}, 0)`)
            .each(function (d) {
              const gBadge = d3.select(this);

              const txt = gBadge
                .append('text')
                .attr('class', 'canvas-badge-text')
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .style('font-size', '12px')
                .style('fill', '#0f172a')
                .style('pointer-events', 'none')
                .text(d.count ?? '');

              let bbox = { width: 12, height: 12 };
              try {
                bbox = txt.node().getBBox();
              } catch {}

              const padX = 8;
              const padY = 4;
              const textStr = String(d.count ?? '');
              const isSingleChar = textStr.length === 1;

              if (isSingleChar) {
                const r = Math.max(bbox.width, bbox.height) / 2 + Math.max(padX, padY) / 2;
                gBadge
                  .insert('circle', 'text')
                  .attr('cx', 0)
                  .attr('cy', 0)
                  .attr('r', r)
                  .style('fill', '#eaf4ff')
                  .style('stroke', '#8fc9ff')
                  .style('stroke-width', 1.5)
                  .style('pointer-events', 'none');
                txt.attr('dy', '0.35em');
              } else {
                const rectW = bbox.width + padX * 2;
                const rectH = bbox.height + padY * 2;
                const rx = Math.min(12, rectH / 2);
                gBadge
                  .insert('rect', 'text')
                  .attr('x', -rectW / 2)
                  .attr('y', -rectH / 2)
                  .attr('width', rectW)
                  .attr('height', rectH)
                  .attr('rx', rx)
                  .attr('ry', rx)
                  .style('fill', '#f1f8ff')
                  .style('stroke', '#d0e7ff')
                  .style('stroke-width', 1.5)
                  .style('pointer-events', 'none');
                txt.attr('dy', '0.35em');
              }
            });

          ng.attr('role', 'treeitem')
            .attr('tabindex', (d) => (d.root ? -1 : 0))
            .attr('aria-label', (d) => d.name)
            .attr('aria-selected', 'false');

          ng.on('click', (event, d) => {
            nodeG.selectAll('g.canvas-node').attr('aria-selected', 'false');

            if (d.root) {
              try {
                svg.call(zoom);
                svg.call(zoom.transform, currentTransform);
                svg.style('cursor', 'grab');
              } catch (err) {}
              return;
            }

            d3.select(event.currentTarget).attr('aria-selected', 'true');

            const payload = { id: d.id, name: d.name, content: d.content || '', count: d.count };
            window.dispatchEvent(new CustomEvent('react-mindmap-node', { detail: payload }));

            if (typeof onNodeClick === 'function') {
              try {
                onNodeClick(payload);
              } catch (err) {}
            }

            try {
              svg.call(zoom);
              svg.call(zoom.transform, currentTransform);
              svg.style('cursor', 'grab');
            } catch (err) {}
          });

          return ng;
        });

      const initialScale = 0.75;
      const initialTransform = d3.zoomIdentity.scale(initialScale).translate(0, 90);
      svg.call(zoom);
      svg.call(zoom.transform, initialTransform);
      currentTransform = initialTransform;

      svg.style('cursor', 'grab');
    }

    draw();

    const ro = new ResizeObserver(() => {
      clearTimeout(drawDebounceRef.current);
      drawDebounceRef.current = setTimeout(() => {
        draw();
      }, 80);
    });
    ro.observe(container);

    function onKeyDown(e) {
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable)
        return;

      const sel = svgRef.current;
      if (!sel) return;

      if (e.key === '+' || e.key === '=' || e.key === 'Add') {
        d3.select(sel).transition().duration(280).call(zoom.scaleBy, 1.25);
        e.preventDefault();
      } else if (e.key === '-') {
        d3.select(sel)
          .transition()
          .duration(280)
          .call(zoom.scaleBy, 1 / 1.25);
        e.preventDefault();
      } else if (e.key === '0') {
        d3.select(sel).transition().duration(350).call(zoom.transform, d3.zoomIdentity);
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', onKeyDown);

    return () => {
      try {
        ro.disconnect();
      } catch {}
      svg.on('.zoom', null);
      window.removeEventListener('keydown', onKeyDown);
      svg.selectAll('*').remove();
    };
  }, [username, heightHint, JSON.stringify(fixedChildren)]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg
        ref={svgRef}
        role="img"
        aria-label="Cleansheet mindmap canvas (renderer)"
        style={{ minHeight: '100%', minWidth: '100%', display: 'block', touchAction: 'none' }}
      />
    </div>
  );
}
