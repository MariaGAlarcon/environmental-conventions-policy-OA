function _1(md){return(
md`# Linking Environmental Conventions, Policy Drivers, and Ocean Accounts Components
This visualization shows the relationships between:
- **Environmental Conventions**
- **Policy Drivers** 
- **Ocean Account Components**

Environmental Conventions included:
  -   **Convention on Biological Diversity - Global Biodiversity Framework (CBD-GBF)**: The Kunming-Montreal Global Biodiversity Framework    adopted in 2022 sets ambitious targets to halt biodiversity loss by 2030, including protecting 30% of land and seas, reducing pollution, and mobilizing $200 billion annually for nature conservation.

  -   **Sustainable Development Goals (SDGs)**: The 2030 Agenda for Sustainable Development adopted by all UN Member States in 2015 provides 17 interconnected goals to achieve peace and prosperity for people and planet, with ocean-specific targets under SDG 14 (Life Below Water) and related marine objectives across multiple goals.

  -   **Agreement on Marine Biodiversity of Areas Beyond National Jurisdiction (BBNJ/High Seas Treaty)**: Adopted in 2023, this legally binding agreement aims to protect biodiversity in international waters through marine protected areas, environmental impact assessments, capacity building, and equitable sharing of marine genetic resources.

  -   **Paris Agreement (UNFCCC)**: The 2015 climate accord commits nations to limit global warming to well below 2°C above pre-industrial levels, with ocean-climate connections recognized through blue carbon ecosystems, coastal adaptation, and nature-based solutions for climate mitigation.

  -   **Global Plastics Treaty (under negotiation)**: This emerging international legally binding instrument aims to end plastic pollution across the entire lifecycle—from production to disposal—with negotiations focusing on reducing plastic production, eliminating harmful plastics, and improving waste management globally.

***Use the controls below to filter views and export the visualization.***

***How these connections were established:*** *The linkages were identified by analyzing each convention's targets and objectives to determine which policy implementation areas they address (e.g., spatial planning, resource management, pollution control), then mapping which ocean accounting components provide the necessary data for each policy area. These represent the most direct and explicit connections—additional indirect linkages likely exist as ocean accounts data can support broader governance needs beyond those mapped here, but this visualization focuses on the clear, documented relationships that demonstrate how a single integrated accounting system can serve multiple international agreements.*`
)}

function _d3(require){return(
require("d3@7")
)}

function _data(d3){return(
d3.csv("https://raw.githubusercontent.com/MariaGAlarcon/environmental-conventions-data.csv/refs/heads/main/C-PD-OA.csv")
)}

function _4(__query,data,invalidation){return(
__query(data,{from:{table:"data"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:["Convention","Policy Driver","Ocean Account Component"]}},invalidation,"data")
)}

function _labelMap(){return(
Object.fromEntries([
  // Conventions
  ["SDGs", "SDGs"],
  ["CBD-GBF", "CBD-GBF"],
  ["Paris Agreement", "Paris Agreement"],
  ["BBNJ", "BBNJ"],
  ["Global Plastics Treaty", "Global Plastics Treaty"],
  
  // Policy Drivers - include variations
  ["Climate-Biodiversity", "Climate-Biodiversity"],
  ["Integrated Monitoring Reporting and Data Systems", "Integrated Monitoring, Reporting and Data Systems"],
  ["Integrated Monitoring, Reporting and Data Systems", "Integrated Monitoring, Reporting and Data Systems"], // with comma
  ["Financial Instruments", "Financial Instruments"],
  ["Governance and Legal Frameworks", "Governance & Legal"],
  ["Integrated Spatial Planning and Management", "Spatial Planning"],
  ["Pollution Reduction and Circular Economy", "Pollution & Circular Economy"],
  
  // Ocean Account Components
  ["Environmental Assets", "Environmental Assets"],
  ["Flows to Environment", "Flows to Environment"],
  ["Governance", "Governance"],
  ["Ocean Economy", "Ocean Economy"],
  ["Social", "Social"]
])
)}

function _allConventions(data){return(
[
  "SDGs",
  "CBD-GBF", 
  "Paris Agreement",
  "BBNJ",
  "Global Plastics Treaty"
  ].filter(c => data.some(d => d.Convention === c))
)}

function _allPolicyDrivers(data){return(
[...new Set(data.map(d => d["Policy Driver"]))].sort()
)}

function _allOceanComponents(data){return(
[...new Set(data.map(d => d["Ocean Account Component"]))].sort()
)}

function _getLabel(labelMap){return(
(text) => labelMap[text] || text
)}

function _conventionToPolicyData(d3,data)
{
  const summary = d3.rollup(
    data,
    v => v.length, // count occurrences
    d => d.Convention,
    d => d["Policy Driver"]
  );
  
  // Convert to flat array format
  const result = [];
  for (const [convention, policyMap] of summary) {
    for (const [policy, count] of policyMap) {
      result.push({
        source: convention,
        target: policy,
        value: count
      });
    }
  }
  return result;
}


function _policyToComponentData(d3,data)
{
  const summary = d3.rollup(
    data,
    v => v.length, // count occurrences
    d => d["Policy Driver"],
    d => d["Ocean Account Component"]
  );
  
  // Convert to flat array format
  const result = [];
  for (const [policy, componentMap] of summary) {
    for (const [component, count] of componentMap) {
      result.push({
        source: policy,
        target: component,
        value: count
      });
    }
  }
  return result;
}


function _conventionToComponentData(d3,data)
{
  const summary = d3.rollup(
    data,
    v => v.length,
    d => d.Convention,
    d => d["Ocean Account Component"]
  );
  
  const result = [];
  for (const [convention, componentMap] of summary) {
    for (const [component, count] of componentMap) {
      result.push({
        source: convention,
        target: component,
        value: count
      });
    }
  }
  return result;
}


function _coverageStats(conventionToPolicyData,policyToComponentData,allConventions,allPolicyDrivers,allOceanComponents)
{
  const activeConventions = new Set(conventionToPolicyData.map(d => d.source));
  const activePolicyDrivers = new Set([...conventionToPolicyData.map(d => d.target), ...policyToComponentData.map(d => d.source)]);
  const activeOceanComponents = new Set(policyToComponentData.map(d => d.target));
  
  return {
    conventions: [activeConventions.size, allConventions.length],
    policyDrivers: [activePolicyDrivers.size, allPolicyDrivers.length], 
    oceanComponents: [activeOceanComponents.size, allOceanComponents.length],
    totalConnections: conventionToPolicyData.length + policyToComponentData.length
  };
}


function _completePathData(data){return(
data.map(row => ({
  convention: row.Convention,
  policy: row["Policy Driver"],
  component: row["Ocean Account Component"]
}))
)}

function _pathCounts(d3,completePathData){return(
d3.rollup(
  completePathData,
  v => v.length,
  d => `${d.convention}|${d.policy}|${d.component}`
)
)}

function _viewMode(Inputs){return(
Inputs.radio(
  ["Full Network", "Convention → Policy Driver", "Policy Driver → Ocean Account Component", "Convention → Ocean Account Component"],
  {value: "Full Network", label: "Select view:"}
)
)}

function _chart(html,viewMode,allConventions,allPolicyDrivers,allOceanComponents,getLabel,conventionToPolicyData,policyToComponentData,conventionToComponentData,d3,XMLSerializer,DOM)
{
  const width = 1200;
  const height = 800;
  const margin = {top: 80, right: 40, bottom: 60, left: 40};
  
  // Convention color mapping
  const conventionColors = {
    "SDGs": "#9b59b6",              // purple
    "CBD-GBF": "#27ae60",           // green
    "Paris Agreement": "#e67e22",    // orange
    "BBNJ": "#3498db",              // blue
    "Global Plastics Treaty": "#e74c3c", // red
    "Basel/Rotterdam/Stockholm": "#f39c12" // yellow/gold
  };
  
  // Policy Driver color mapping
  const policyColors = "#666666";      // gray for all policy drivers
  const componentColor = "#333333";   // darker gray for ocean components

    // Full names for legend
  const fullNames = {
    "SDGs": "Sustainable Development Goals",
    "CBD-GBF": "Convention on Biological Diversity - Global Biodiversity Framework",
    "Paris Agreement": "Paris Agreement on Climate Change",
    "BBNJ": "Biodiversity Beyond National Jurisdiction",
    "Global Plastics Treaty": "Global Plastics Treaty",
    "Climate-Biodiversity": "Climate-Biodiversity",
    "Financial Instruments": "Financial Instruments",
    "Governance and Legal Frameworks": "Governance and Legal Frameworks",
    "Integrated Monitoring Reporting and Data Systems": "Integrated Monitoring, Reporting and Data Systems",
    "Integrated Monitoring, Reporting and Data Systems": "Integrated Monitoring, Reporting and Data Systems",
    "Integrated Spatial Planning and Management": "Integrated Spatial Planning and Management",
    "Pollution Reduction and Circular Economy": "Pollution Reduction and Circular Economy"
  };

  // Create export button
  const exportBtn = html`<button style="margin-bottom: 20px; padding: 5px 15px; background: #4269d0; color: white; border: none; border-radius: 4px; cursor: pointer;">
    Export as PNG
  </button>`;
    
  // Determine what to show based on view
  const showConventions = viewMode === "Full Network" || viewMode === "Convention → Policy Driver" || viewMode === "Convention → Ocean Account Component";
  const showPolicyDrivers = viewMode === "Full Network" || viewMode === "Convention → Policy Driver" || viewMode === "Policy Driver → Ocean Account Component";
  const showOceanComponents = viewMode === "Full Network" || viewMode === "Policy Driver → Ocean Account Component" || viewMode === "Convention → Ocean Account Component";
  
  // Column positions based on view
  let columnX;
  if (viewMode === "Full Network") {
    columnX = [
      margin.left + 250,  // conventions
      width / 2,          // policy drivers
      width - margin.right - 250  // ocean components
    ];
  } else if (viewMode === "Convention → Policy Driver") {
    columnX = [
      margin.left + 250,  // conventions
      width - margin.right - 250  // policy drivers
    ];
  } else if (viewMode === "Policy Driver → Ocean Account Component") {
    columnX = [
      margin.left + 250,  // policy drivers
      width - margin.right - 250  // ocean components
    ];
  } else { // Convention → Ocean Account Component
    columnX = [
      margin.left + 250,  // conventions
      width - margin.right - 250  // ocean components
    ];
  }
  
  // Calculate vertical spacing
  const availableHeight = height - margin.top - margin.bottom - 60; // Leave more space for legend;
  const conventionSpacing = availableHeight / (allConventions.length + 0.5);
  const policySpacing = availableHeight / (allPolicyDrivers.length + 0.5);
  const componentSpacing = availableHeight / (allOceanComponents.length + 0.5);
  
  // Create nodes for ALL categories
  const nodes = [];
  
  if (showConventions) {
    allConventions.forEach((convention, i) => {
      nodes.push({
        id: convention,
        label: getLabel(convention),
        x: columnX[0],
        y: margin.top + (i + 0.5) * conventionSpacing,
        type: "convention"
      });
    });
  }
  
  if (showPolicyDrivers) {
    allPolicyDrivers.forEach((policy, i) => {
      nodes.push({
        id: policy,
        label: getLabel(policy),
        x: columnX[viewMode === "Policy Driver → Ocean Account Component" ? 0 : 1],
        y: margin.top + (i + 0.5) * policySpacing,
        type: "policy"
      });
    });
  }
  
  if (showOceanComponents) {
    allOceanComponents.forEach((component, i) => {
      nodes.push({
        id: component,
        label: getLabel(component),
        x: columnX[columnX.length - 1],
        y: margin.top + (i + 0.5) * componentSpacing,
        type: "component"
      });
    });
  }
  
  // Create node lookup map
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  // Identify which nodes have connections
  const connectedNodes = new Set();
  conventionToPolicyData.forEach(d => {
    connectedNodes.add(d.source);
    connectedNodes.add(d.target);
  });
  policyToComponentData.forEach(d => {
    connectedNodes.add(d.source);
    connectedNodes.add(d.target);
  });
  
  // Create links (only where connections exist in data)
  const links = [];
  // Track which conventions lead to each policy driver (can be multiple)
  const policyToConventionsMap = new Map();
  
  if (showConventions && showPolicyDrivers && viewMode !== "Policy Driver → Ocean Account Component") {
    conventionToPolicyData.forEach(d => {
      if (nodeMap.has(d.source) && nodeMap.has(d.target)) {
        links.push({
          source: d.source,
          target: d.target,
          count: d.value,
          type: "convention-policy",
          originId: d.source,
          originType: "convention"
        });
        
        // Track ALL conventions that lead to this policy
        if (!policyToConventionsMap.has(d.target)) {
          policyToConventionsMap.set(d.target, []);
        }
        policyToConventionsMap.get(d.target).push({
          convention: d.source,
          count: d.value
        });
      }
    });
  }
  
if (showPolicyDrivers && showOceanComponents && viewMode !== "Convention → Policy Driver") {
  // Create a lookup set of visible node IDs
  const visibleNodeIds = new Set(nodes.map(n => n.id));

  policyToComponentData.forEach(d => {
    const isVisible = visibleNodeIds.has(d.source) && visibleNodeIds.has(d.target);
    if (isVisible) {
      links.push({
        source: d.source,
        target: d.target,
        count: d.value,
        type: "policy-component",
        originId: d.source,
        originType: "policy"
      });
    }
  });
}

  
  // For direct Convention → Ocean Account Component view
  if (viewMode === "Convention → Ocean Account Component") {
    conventionToComponentData.forEach(d => {
      if (nodeMap.has(d.source) && nodeMap.has(d.target)) {
        links.push({
          source: d.source,
          target: d.target,
          count: d.value,
          type: "convention-component",
          originId: d.source,
          originType: "convention"
        });
      }
    });
  }
  
  // Create SVG
  const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("font-family", "Arial, sans-serif")
    .style("background", "white");
  
  // Add gradient definitions
  const defs = svg.append("defs");
  
  // Create gradients for conventions
  Object.entries(conventionColors).forEach(([convention, color]) => {
    const gradient = defs.append("linearGradient")
      .attr("id", `gradient-convention-${convention.replace(/[\s\/]/g, '-')}`)
      .attr("x1", "0%").attr("x2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .style("stop-color", color)
      .style("stop-opacity", 0.8);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .style("stop-color", color)
      .style("stop-opacity", 0.3);
  });
  
  // Create gradients for policy drivers
  Object.entries(policyColors).forEach(([policy, color]) => {
    const gradient = defs.append("linearGradient")
      .attr("id", `gradient-policy-${policy.replace(/[\s\/]/g, '-')}`)
      .attr("x1", "0%").attr("x2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .style("stop-color", color)
      .style("stop-opacity", 0.8);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .style("stop-color", color)
      .style("stop-opacity", 0.3);
  });
  
  // Add column headers
  if (showConventions) {
    svg.append("text")
      .attr("x", columnX[0])
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", "16px")
      .text("Environmental Conventions");
  }
  
  if (showPolicyDrivers) {
    svg.append("text")
      .attr("x", columnX[viewMode === "Policy Driver → Ocean Account Component" ? 0 : showConventions ? 1 : 0])
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", "16px")
      .text("Policy Drivers");
  }
  
  if (showOceanComponents) {
    svg.append("text")
      .attr("x", columnX[columnX.length - 1])
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", "16px")
      .text("Ocean Account Components");
  }
  
  // Add links
  const linkGroup = svg.append("g");
  
  links.forEach(link => {
    const sourceNode = nodeMap.get(link.source);
    const targetNode = nodeMap.get(link.target);
    
    if (sourceNode && targetNode) {
      // Determine color based on origin type and ID
      // Determine color based on origin type and ID
      let strokeColor;
      if (link.originType === "convention") {
        const conventionId = link.originId.replace(/[\s\/]/g, '-');
        strokeColor = conventionColors[link.originId] 
          ? `url(#gradient-convention-${conventionId})`
          : "#cccccc";
      } else if (link.originType === "policy") {
        // For policy connections
        if (viewMode === "Full Network" && link.type === "policy-component") {
          // Use a neutral gray for all policy->component in Full Network
          strokeColor = "#888888";
        } else {
          // Use policy colors in Policy Driver view
          const policyId = link.originId.replace(/[\s\/]/g, '-');
          strokeColor = policyColors[link.originId] 
            ? `url(#gradient-policy-${policyId})`
            : "#cccccc";
        }
      } else {
        strokeColor = "#cccccc"; // fallback
      }
      const path = linkGroup.append("path")
        .attr("d", () => {
          const midX = (sourceNode.x + targetNode.x) / 2;
          return `M ${sourceNode.x} ${sourceNode.y} Q ${midX} ${sourceNode.y} ${targetNode.x} ${targetNode.y}`;
        })
        .attr("fill", "none")
        .attr("stroke", strokeColor)
        .attr("stroke-width", Math.sqrt(link.count) * 2)
        .attr("opacity", () => {
          // Lower opacity for policy->component in Full Network
          if (viewMode === "Full Network" && link.type === "policy-component") {
            return 0.3;
          }
          return 0.6;
        });
      
      path.append("title")
        .text(`${getLabel(link.source)} → ${getLabel(link.target)}\n${link.count} connections`);
    }
  });
  
  // Add nodes
  const nodeGroup = svg.append("g");
  
  nodes.forEach(node => {
    const g = nodeGroup.append("g");
    const hasConnection = connectedNodes.has(node.id);
    
    // Node circle
    g.append("circle")
      .attr("cx", node.x)
      .attr("cy", node.y)
      .attr("r", hasConnection ? 5 : 3)
      .attr("fill", () => {
        if (!hasConnection) return "#d0d0d0";
        if (node.type === "convention") return conventionColors[node.id] || "#4269d0";
        if (node.type === "policy" && viewMode === "Policy Driver → Ocean Account Component") {
          return policyColors[node.id] || "#666666";
        }
        return "#666666";
      });
    
    // Node label
    g.append("text")
      .attr("x", node.x)
      .attr("y", node.y)
      .attr("dx", () => {
        if (node.type === "convention") return -10;
        if (node.type === "component") return 10;
        return 0;
      })
      .attr("dy", node.type === "policy" ? -10 : 4)
      .attr("text-anchor", () => {
        if (node.type === "convention") return "end";
        if (node.type === "component") return "start";
        return "middle";
      })
      .style("font-size", hasConnection ? "12px" : "11px")
      .style("fill", hasConnection ? "#333" : "#999")
      .style("font-weight", hasConnection ? "normal" : "300")
      .text(node.label);
  });

  // Add legend with full names
  const legendData = [];
  
  if (showConventions && viewMode !== "Policy Driver → Ocean Account Component") {
    legendData.push({name: "Environmental Conventions:", color: null, type: "header"});
    Object.entries(conventionColors).forEach(([name, color]) => {
      if (allConventions.includes(name)) {
        const fullName = fullNames[name] || name;
        legendData.push({name: `${name} - ${fullName}`, color, type: "convention"});
      }
    });
  }
  
  if (viewMode === "Policy Driver → Ocean Account Component") {
    legendData.push({name: "Policy Drivers:", color: null, type: "header"});
    allPolicyDrivers.forEach(policy => {
      const color = policyColors[policy] || "#666666";
      legendData.push({name: getLabel(policy), color, type: "policy"});
    });
  }
  
  if (legendData.length > 0) {
    legendData.push({name: "", color: null, type: "spacer"}); // Add space
  }
  
  legendData.push({name: "Connection thickness indicates number of relationships", color: null, type: "note"});
  
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${margin.left + 110}, ${margin.bottom + 600})`);
  
  let yOffset = 0;
  legendData.forEach((item) => {
    const legendItem = legend.append("g")
      .attr("transform", `translate(0, ${yOffset})`);
    
    if (item.type === "header") {
      legendItem.append("text")
        .style("font-weight", "bold")
        .style("font-size", "14px")
        .text(item.name);
    } else if (item.type === "note") {
      legendItem.append("text")
        .style("font-style", "italic")
        .style("font-size", "12px")
        .style("fill", "#666")
        .text(item.name);
    } else if (item.type === "spacer") {
      // Just add space
    } else if (item.color) {
      legendItem.append("circle")
        .attr("r", 5)
        .attr("cx", 10)
        .attr("fill", item.color);
      
      legendItem.append("text")
        .attr("x", 20)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .text(item.name);
    }
    
    yOffset += item.type === "header" ? 20 : item.type === "spacer" ? 10 : 18;
  });

  // Export functionality
  exportBtn.onclick = () => {
    const svgElement = svg.node();
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = DOM.canvas(width, height);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `network-visualization-${viewMode.replace(/[\s→]/g, '-')}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };
  
  return html`<div>
    ${exportBtn}
    ${svg.node()}
  </div>`;
  
  return svg.node();
}


export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer("data")).define("data", ["d3"], _data);
  main.variable(observer()).define(["__query","data","invalidation"], _4);
  main.variable(observer("labelMap")).define("labelMap", _labelMap);
  main.variable(observer("allConventions")).define("allConventions", ["data"], _allConventions);
  main.variable(observer("allPolicyDrivers")).define("allPolicyDrivers", ["data"], _allPolicyDrivers);
  main.variable(observer("allOceanComponents")).define("allOceanComponents", ["data"], _allOceanComponents);
  main.variable(observer("getLabel")).define("getLabel", ["labelMap"], _getLabel);
  main.variable(observer("conventionToPolicyData")).define("conventionToPolicyData", ["d3","data"], _conventionToPolicyData);
  main.variable(observer("policyToComponentData")).define("policyToComponentData", ["d3","data"], _policyToComponentData);
  main.variable(observer("conventionToComponentData")).define("conventionToComponentData", ["d3","data"], _conventionToComponentData);
  main.variable(observer("coverageStats")).define("coverageStats", ["conventionToPolicyData","policyToComponentData","allConventions","allPolicyDrivers","allOceanComponents"], _coverageStats);
  main.variable(observer("completePathData")).define("completePathData", ["data"], _completePathData);
  main.variable(observer("pathCounts")).define("pathCounts", ["d3","completePathData"], _pathCounts);
  main.variable(observer("viewof viewMode")).define("viewof viewMode", ["Inputs"], _viewMode);
  main.variable(observer("viewMode")).define("viewMode", ["Generators", "viewof viewMode"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["html","viewMode","allConventions","allPolicyDrivers","allOceanComponents","getLabel","conventionToPolicyData","policyToComponentData","conventionToComponentData","d3","XMLSerializer","DOM"], _chart);
  return main;
}
