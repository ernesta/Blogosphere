(function($) {
	// Constants
	// Container
	var WIDTH = 400;
	var HEIGHT = 400;
	// Node
	var RADIUS = 8;
	// Arrowhead
	var MARKER = 8;
	var OFFSET = 20;
	// Transitions
	var TIME = 500;
	// Colors
	var COLOR = d3.scale.category20();
	// DOM
	var CONTAINER = "#network";
	
	// Elements
	var force = d3.layout.force()
		.charge(-120)
		.linkDistance(50)
		.size([WIDTH, HEIGHT]);
		
	var svg = d3.select(CONTAINER).append("svg")
		.attr("width", WIDTH)
		.attr("height", HEIGHT);
	
	// Network
	d3.json("blogs.json", function(error, graph) {
		if (error) throw error;
		
		force
			.nodes(graph.nodes)
			.links(graph.links)
			.start();
		
		var def = svg.append("svg:defs")
		
		var marker = def.selectAll("marker")
		    .data(["end"])
		    .enter().append("svg:marker")
		    .attr("id", "end")
		    .attr("viewBox", "0 -5 10 10")
		    .attr("refX", OFFSET)
		    .attr("refY", -1.5)
		    .attr("markerWidth", MARKER)
		    .attr("markerHeight", MARKER)
		    .attr("orient", "auto")
		    .append("svg:path")
		    .attr("d", "M0,-5L10,0L0,5");
		
		var link = svg.append("svg:g").selectAll(".link")
			.data(force.links())
			.enter().append("path")
			.attr("class", "link")
			.style("stroke-width", function(d) { d.value; })
			.attr("marker-end", "url(#end)");
		
		var node = svg.selectAll(".node")
			.data(force.nodes())
			.enter().append("g")
			.attr("class", "node")
			.on("mouseover", mouseover)
			.on("mouseout", mouseout)
			.call(force.drag);
		
		node.append("circle")
			.attr("r", function(d) {
				return 30 * d.importance;
			})
			.style("fill", function(d) {
				return stringToColor(d.name);
			})
		
		node.append("text")
			.attr("dx", 12)
			.attr("dy", ".35em")
			.text(function(d) {
				return d.name
			});
		
		force.on("tick", function() {
			link.attr("d", function(d) {
				var dx = d.target.x - d.source.x;
				var dy = d.target.y - d.source.y;
				var dr = Math.sqrt(dx * dx + dy * dy);
				
				return "M" + 
					d.source.x + "," + 
					d.source.y + "A" + 
					dr + "," + dr + " 0 0,1 " + 
					d.target.x + "," + 
					d.target.y;
			    });
			
			node.attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			});
		});
	});
	
	
	function stringToColor(value) {
		var hash = "";
		
		for (var i = 0; i < value.length; i++) {
			hash += value.charCodeAt(i);
		}
		
		return COLOR(parseInt(hash));
	}
	
	function mouseover() {
		d3.select(this).select("circle").transition()
			.duration(TIME)
			.attr("r", 1.3 * RADIUS);
	}
	
	function mouseout() {
		d3.select(this).select("circle").transition()
			.duration(TIME)
			.attr("r", RADIUS);
	}
	
})(jQuery)