import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import Cookies from 'js-cookie';

function capitalizeName(raw) {
  if (!raw) return 'User';
  return String(raw)
    .split(' ')
    .map((p) => (p.length ? p[0].toUpperCase() + p.slice(1) : ''))
    .join(' ');
}

export default function CleanSheetLearnerCanvas({
  width = 1200,
  height = 700,
  persona = null,
  data = null,
  currentViewMode = 'learner',
  onNodeClick = () => {},
  onOpenFeature = () => {},
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [renderKey, setRenderKey] = useState(0);
  const usernameRaw = Cookies.get('atlas_username') || 'User';
  const username = capitalizeName(usernameRaw);
  const mountedOnce = useRef(false);

  const TERTIARY_COLOR = '#004C99';

  function buildNetworkFromPersona(personaObj) {
    const nodes = [];
    const links = [];

    nodes.push({
      id: 'center',
      label: personaObj?.name || username,
      tier: 'center',
      center: true,
      r: 32,
      color: '#0665D0',
    });

    (personaObj?.children || []).forEach((feature, idx) => {
      const featureId = `feature-${idx}`;
      const hasChildren = !!(feature.children && feature.children.length);
      const shouldStartCollapsed =
        currentViewMode === 'personal' &&
        (feature.name === 'Finance' || feature.name === 'Shopping');

      const expanded =
        typeof feature._expanded === 'boolean' ? feature._expanded : !shouldStartCollapsed;

      nodes.push({
        id: featureId,
        label: feature.name,
        tier: 'primary',
        count: feature.count || 0,
        icon: feature.icon,
        data: feature,
        hasChildren,
        expanded,
        r: 20,
      });

      links.push({ source: 'center', target: featureId });

      if (hasChildren && expanded) {
        feature.children.forEach((child, cidx) => {
          const childId = `child-${idx}-${cidx}`;
          nodes.push({
            id: childId,
            label: child.name,
            tier: 'tertiary',
            count: child.count || 0,
            icon: child.icon,
            data: child,
            parentId: featureId,
            r: 18,
          });
          links.push({ source: featureId, target: childId });
        });
      }
    });

    return { nodes, links };
  }

  function buildGraph() {
    if (persona && persona.children) return buildNetworkFromPersona(persona);
    if (data && data.nodes && data.links) {
      const copyNodes = data.nodes.map((n) => ({ tier: 'primary', r: n.r || 18, ...n }));
      return { nodes: copyNodes, links: data.links.map((l) => ({ ...l })) };
    }
    const sample = {
      nodes: [
        { id: 'center', label: username, r: 32, center: true, color: '#0066CC', tier: 'center' },
        { id: 'goals', label: 'Goals', r: 20, count: 6, tier: 'primary' },
        { id: 'projects', label: 'Projects', r: 20, tier: 'primary' },
        { id: 'portfolio', label: 'Portfolio', r: 20, count: 2, tier: 'primary' },
        { id: 'mylib', label: 'My Library', r: 20, tier: 'primary' },
        { id: 'exp', label: 'Career Experience', r: 20, count: 5, tier: 'primary' },
        { id: 'code', label: 'Code Snippets', r: 20, tier: 'primary' },
      ],
      links: [
        { source: 'center', target: 'goals' },
        { source: 'center', target: 'projects' },
        { source: 'center', target: 'portfolio' },
        { source: 'center', target: 'mylib' },
        { source: 'center', target: 'exp' },
        { source: 'center', target: 'code' },
      ],
    };
    return sample;
  }

  function handleFeatureClick(nodeName) {
    const financeSections = ['Insurance', 'Cash Flow', 'Assets', 'Liabilities', 'Investments'];
    const shoppingSections = ['Grocery', 'Home', 'Internet', 'Gifts'];

    if (nodeName === 'Career Experience') {
      onOpenFeature('Career Experience');
    } else if (nodeName === 'Goals') {
      onOpenFeature('Goals');
    } else if (nodeName === 'Portfolio') {
      onOpenFeature('Portfolio');
    } else if (nodeName === 'Projects') {
      onOpenFeature('Projects');
    } else if (nodeName === 'Code Snippets') {
      onOpenFeature('Code Snippets');
    } else if (nodeName === 'My Library') {
      onOpenFeature('My Library');
    } else if (nodeName === 'My Notes') {
      onOpenFeature('My Notes');
    } else if (nodeName === 'Shopping') {
      onOpenFeature('Shopping');
    } else if (nodeName === 'Finance') {
      onOpenFeature('Finance');
    } else if (nodeName === 'Calendar') {
      onOpenFeature('Calendar');
    } else if (nodeName === 'Recipes') {
      onOpenFeature('Recipes');
    } else if (financeSections.includes(nodeName)) {
      onOpenFeature('Finance', nodeName);
    } else if (shoppingSections.includes(nodeName)) {
      onOpenFeature('Shopping', nodeName);
    } else {
      onOpenFeature(nodeName);
    }
  }

  function toggleNodeExpansion(nodeId) {
    if (!persona || !persona.children) return;
    const idx = nodeId.startsWith('feature-') ? Number(nodeId.split('-')[1]) : -1;
    if (idx < 0 || !persona.children[idx]) return;

    persona.children[idx]._expanded = !persona.children[idx]._expanded;
    setRenderKey((k) => k + 1);
  }

  useEffect(() => {
    const graph = buildGraph();
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll('*').remove();

    svgEl.style('outline', 'none').attr('tabindex', -1);

    const defs = svgEl.append('defs');
    defs
      .append('filter')
      .attr('id', 'soft-shadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')
      .append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 2)
      .attr('stdDeviation', 4)
      .attr('flood-color', '#000')
      .attr('flood-opacity', 0.12);

    // root group that we'll transform with d3.zoom
    const gRoot = svgEl
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%')
      .append('g')
      .attr('class', 'root-group');

    const cx = width / 2;
    const cy = height / 2;

    const nodes = graph.nodes.map((d) => ({ ...d }));
    const links = graph.links.map((d) => ({ ...d }));

    nodes.forEach((n) => {
      if (n.center) {
        n.x = cx + (Math.random() - 0.5) * 12;
        n.y = cy + (Math.random() - 0.5) * 12;
      } else {
        n.x = cx + (Math.random() - 0.5) * 60;
        n.y = cy + (Math.random() - 0.5) * 60;
      }
    });

    function rectForTier(d) {
      if (d.tier === 'center') return { w: 180, h: 44 };
      if (d.tier === 'primary') return { w: 140, h: 40 };
      if (d.tier === 'tertiary') return { w: 140, h: 40 };
      if (d.tier === 'secondary') return { w: 150, h: 40 };
      return { w: 120, h: 36 };
    }

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance((d) => {
            const sTier = typeof d.source === 'object' ? d.source.tier : d.source;
            const tTier = typeof d.target === 'object' ? d.target.tier : d.target;
            const isRootLink = sTier === 'center' || tTier === 'center';
            if (currentViewMode === 'personal') {
              return isRootLink ? 220 : 140;
            }
            return isRootLink ? 220 : 180;
          })
          .strength(0.68),
      )
      .force('charge', d3.forceManyBody().strength(currentViewMode === 'personal' ? -160 : -220))
      .force(
        'collide',
        d3
          .forceCollide()
          .radius((d) => (d.r || 18) + 18)
          .iterations(3),
      )
      .force('center', d3.forceCenter(cx, cy))
      .velocityDecay(0.35);

    simulation.force('radialPush', () => {
      nodes.forEach((d) => {
        if (!d.__dragging) {
          const dx = d.x - cx || 0.0001;
          const dy = d.y - cy || 0.0001;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let desired = 190;
          if (d.tier === 'primary') desired = currentViewMode === 'personal' ? 180 : 200;
          if (d.tier === 'tertiary') desired = currentViewMode === 'personal' ? 260 : 280;
          if (d.tier === 'center') desired = 0;
          d.vx += (dx / (dist || 1)) * (desired - dist) * 0.03 || 0;
          d.vy += (dy / (dist || 1)) * (desired - dist) * 0.03 || 0;
        }
      });
    });

    const link = gRoot
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#cfe3ff')
      .attr('stroke-linecap', 'butt')
      .attr('stroke-width', 1.1)
      .attr('opacity', 0.92)
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('shape-rendering', 'geometricPrecision');

    const node = gRoot
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes, (d) => d.id)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', (d) => (d.center ? 'grab' : 'pointer'))
      .attr('tabindex', -1)
      .style('outline', 'none');

    node
      .append('rect')
      .attr('x', (d) => -rectForTier(d).w / 2)
      .attr('y', (d) => -rectForTier(d).h / 2)
      .attr('width', (d) => rectForTier(d).w)
      .attr('height', (d) => rectForTier(d).h)
      .attr('rx', 10)
      .attr('fill', (d) => {
        if (d.center) return d.color || '#0665D0';
        if (d.tier === 'tertiary') return TERTIARY_COLOR;
        return currentViewMode === 'personal' ? 'rgba(34,197,94,0.15)' : '#e6f3ff';
      })
      .attr('stroke', (d) => (d.center ? 'none' : 'rgba(6,101,208,0.06)'))
      .attr('filter', (d) => (d.center ? 'url(#soft-shadow)' : null))
      .attr('opacity', 1)
      .attr('transform', 'scale(1)')
      .each(function (d, i) {
        if (!mountedOnce.current) {
          d3.select(this)
            .attr('transform', 'scale(0.98)')
            .transition()
            .delay(40 + i * 10)
            .duration(280)
            .ease(d3.easeCubicOut)
            .attr('transform', 'scale(1)');
        }
      });

    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .text((d) => d.label)
      .style('font-family', 'Inter, Roboto, system-ui, sans-serif')
      .style('font-size', (d) => (d.center ? '15px' : '13px'))
      .style('fill', (d) => (d.center ? '#fff' : '#0f172a'))
      .attr('opacity', 1);

    const BADGE_OFFSET_X = 14;
    const BADGE_OFFSET_Y = -6;

    node
      .append('g')
      .attr('class', 'badge')
      .attr('transform', (d) => {
        const { w } = rectForTier(d);
        const baseX = w / 2 - 18;
        const baseY = -20;
        return `translate(${baseX + BADGE_OFFSET_X},${baseY + BADGE_OFFSET_Y})`;
      })
      .style('opacity', (d) => (d.count ? 1 : 0))
      .each(function (d) {
        const g = d3.select(this);
        g.append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', 10)
          .attr('fill', 'rgb(227, 242, 253)')
          .attr('stroke', '#0066CC')
          .attr('stroke-width', 1);

        g.append('text')
          .text((d) => (d.count ? d.count : ''))
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .style('font-size', '11px')
          .style('fill', '#0b2447');
      });

    let currentTransform = d3.zoomIdentity;

    const zoom = d3
      .zoom()
      .scaleExtent([0.35, 3.5])
      .wheelDelta((event) => {
        const delta = -event.deltaY;
        return delta / 500;
      })
      .translateExtent([
        [-8000, -8000],
        [8000, 8000],
      ])
      .filter((event) => {
        if (!event) return false;
        if (event.type === 'wheel') return true;

        if (
          event.type === 'pointerdown' ||
          event.type === 'mousedown' ||
          event.type === 'touchstart'
        ) {
          try {
            const tgt = event.target;
            if (tgt && tgt.closest && tgt.closest('.node-group')) return false;
          } catch (e) {}
          return true;
        }

        return true;
      })
      .on('zoom', (event) => {
        currentTransform = event.transform;
        gRoot.attr('transform', currentTransform.toString());
        if (
          event.sourceEvent &&
          (event.sourceEvent.type === 'mousemove' || event.sourceEvent.type === 'pointermove')
        ) {
          svgEl.style('cursor', 'grabbing');
        } else {
          svgEl.style('cursor', 'grab');
        }
      });

    svgEl.on('dblclick.zoom', null);

    svgEl.call(zoom);
    svgEl.call(zoom.transform, currentTransform);
    svgEl.style('cursor', 'grab');

    const dragBehavior = d3
      .drag()
      .on('start', (event, d) => {
        d.__dragging = true;
        if (!event.active) simulation.alphaTarget(0.12).restart();
        d.fx = event.x;
        d.fy = event.y;

        try {
          const targetEl = event.subject?.node || event.sourceEvent?.target;
          let targetGroup = null;
          if (targetEl && typeof targetEl.closest === 'function') {
            const groupEl = targetEl.closest('g');
            if (groupEl) targetGroup = d3.select(groupEl);
            else targetGroup = d3.select(targetEl);
          } else if (targetEl) {
            targetGroup = d3.select(targetEl);
          }
        } catch (e) {}

        d3.select(event.subject?.node || event.sourceEvent?.target)
          .select('rect')
          .transition()
          .duration(120)
          .ease(d3.easeCubicOut)
          .attr('transform', 'scale(1.03)');
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        d.__dragging = false;
        if (!event.active) simulation.alphaTarget(0.01);
        d.fx = null;
        d.fy = null;

        try {
          d3.select(event.subject?.node || event.sourceEvent?.target)
            .select('rect')
            .transition()
            .duration(160)
            .ease(d3.easeCubicOut)
            .attr('transform', 'scale(1)');
        } catch (e) {}
      });

    node.call(dragBehavior);

    function findNodeGroup(el) {
      while (el && el !== document && !el.classList?.contains?.('node-group')) {
        el = el.parentNode;
      }
      return el;
    }

    function handleNodePointerUp(event, d) {
      if (event.defaultPrevented) return;
      if (event.sourceEvent && event.sourceEvent.defaultPrevented) return;
      if (d.__dragging) return;

      if (d.center) return;

      const payload = { id: d.id, name: d.label, content: d.content || '', count: d.count ?? 0 };
      try {
        window.dispatchEvent(new CustomEvent('react-mindmap-node', { detail: payload }));
      } catch (err) {}
      try {
        if (typeof onNodeClick === 'function') onNodeClick(payload);
      } catch (err) {}

      if (d.tier === 'primary') {
        if (currentViewMode === 'personal' && d.hasChildren) {
          toggleNodeExpansion(d.id);
          return;
        } else {
          handleFeatureClick(d.label);
        }
      } else if (d.tier === 'tertiary') {
        handleFeatureClick(d.label);
      } else {
        handleFeatureClick(d.label);
      }

      try {
        const el = findNodeGroup(event.currentTarget) || event.currentTarget;
        if (el && typeof el.blur === 'function') el.blur();
      } catch (e) {}
    }

    node.on('pointerup', handleNodePointerUp);
    node.selectAll('rect').on('pointerup', handleNodePointerUp);
    node.selectAll('text').on('pointerup', handleNodePointerUp);
    node.on('click', handleNodePointerUp);

    node
      .on('mouseover', function (event, d) {
        const rect = d3.select(this).select('rect');
        if (d.tier === 'primary') {
          rect
            .transition()
            .duration(140)
            .ease(d3.easeQuadOut)
            .attr('fill', currentViewMode === 'personal' ? 'rgba(34,197,94,0.28)' : '#dfefff');
        } else if (d.tier === 'tertiary') {
          rect.transition().duration(140).ease(d3.easeQuadOut).attr('fill', '#13579f');
        } else {
          rect
            .transition()
            .duration(140)
            .ease(d3.easeQuadOut)
            .attr('fill', d.center ? d.color || '#0665D0' : '#f7fbff');
        }
      })
      .on('mouseout', function (event, d) {
        const rect = d3.select(this).select('rect');
        rect
          .transition()
          .duration(140)
          .ease(d3.easeCubicOut)
          .attr(
            'fill',
            d.center
              ? d.color || '#0665D0'
              : d.tier === 'tertiary'
                ? TERTIARY_COLOR
                : currentViewMode === 'personal'
                  ? 'rgba(34,197,94,0.15)'
                  : '#e6f3ff',
          );
      });

    simulation.on('tick', () => {
      link.each(function (d) {
        const s = typeof d.source === 'object' ? d.source : nodes.find((n) => n.id === d.source);
        const t = typeof d.target === 'object' ? d.target : nodes.find((n) => n.id === d.target);
        if (!s || !t) return;

        const sx = s.x;
        const sy = s.y;
        const tx = t.x;
        const ty = t.y;
        const dx = tx - sx;
        const dy = ty - sy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;

        const { w: sw, h: sh } = rectForTier(s);
        const { w: tw, h: th } = rectForTier(t);

        function offsetForRect(dx_, dy_, rw, rh) {
          const angle = Math.atan2(dy_, dx_);
          const rectAngle = Math.atan2(rh, rw);
          let offset;
          if (Math.abs(angle) < rectAngle || Math.abs(angle) > Math.PI - rectAngle) {
            offset = rw / 2 / Math.abs(Math.cos(angle));
          } else {
            offset = rh / 2 / Math.abs(Math.sin(angle));
          }
          return offset;
        }

        const sOffset = offsetForRect(dx, dy, sw, sh);
        const tOffset = offsetForRect(dx, dy, tw, th);

        const x1 = sx + (dx / dist) * sOffset;
        const y1 = sy + (dy / dist) * sOffset;
        const x2 = tx - (dx / dist) * tOffset;
        const y2 = ty - (dy / dist) * tOffset;

        d3.select(this).attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2);
      });

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    simulation.alphaTarget(0.01).restart();

    mountedOnce.current = true;

    return () => {
      try {
        simulation.stop();
      } catch (e) {}
      try {
        svgEl.on('.zoom', null);
      } catch (e) {}
      svgEl.selectAll('*').remove();
    };
  }, [
    data,
    persona,
    width,
    height,
    currentViewMode,
    renderKey,
    username,
    onNodeClick,
    onOpenFeature,
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-white rounded-lg shadow-inner relative overflow-hidden p-6"
      style={{ touchAction: 'none' }}
    >
      <svg ref={svgRef} className="w-full h-full block" />
    </div>
  );
}
