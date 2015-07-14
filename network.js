(function($) {
	// DOM
	var CONTAINER = "#network";
	// Container
	var WIDTH = $(CONTAINER).width();
	var HEIGHT = $(CONTAINER).height();
	// Node
	var RADIUS = 3000;
	// Arrowhead
	var MARKER = 8;
	var OFFSET = 20;
	// Transitions
	var TIME = 250;
	// Colors
	var COLOR = d3.scale.category20b();
	
	// Resizing
	d3.select(window).on('resize', resize);
	
	// Elements
	var force = d3.layout.force()
		.charge(-120)
		.linkDistance(200)
		.size([WIDTH, HEIGHT]);
	
	var svg = d3.select(CONTAINER).append("svg")
		.attr("viewBox", "0 0 " + WIDTH + " " + HEIGHT);
	
	// Search
	$("#search").keyup(onKeyUp);
	
	// Network
	d3.json("blogs.json", function(error, graph) {
		if (error) throw error;
		
		force
			.nodes(graph.nodes)
			.links(graph.links)
			.start();
		
		var def = svg.append("svg:defs");
		
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
			.on("click", click)
			.call(force.drag);
		
		node.append("circle")
			.attr("r", function(d) {
				return RADIUS * d.importance;
			})
			.style("fill", function(d) {
				return stringToColor(d.name);
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
	
	function resize() {
		var width = $(window).width();
		var height = $(window).height();
		svg.attr("width", width).attr("height", height);
	}
	
	function stringToColor(value) {
		var hash = "";
		
		for (var i = 0; i < value.length; i++) {
			hash += value.charCodeAt(i);
		}
		
		return COLOR(parseInt(hash));
	}
	
	function mouseover(d) {
		$("#blog .value").empty().append("<a href='" + d.URL + "'>" + d.name + "</a>")
		$("#inlinks .value").text(d.inlinks);
		
		d3.select(this).select("circle").transition()
			.duration(TIME)
			.attr("r", 1.2 * RADIUS * d.importance);
	}
	
	function mouseout(d) {
		d3.select(this).select("circle").transition()
			.duration(TIME)
			.attr("r", RADIUS * d.importance);
	}
	
	function click(d) {
		if (!d3.event.defaultPrevented) {
			window.open(d.URL, "_blank");
		}
	}
	
	function onKeyUp() {
		query = $(this).val();
		delay = 1000;
		window.setTimeout(function() {
			pulse(query);
		}, delay);
	}
	
	function pulse(query) {
		if (query.length > 2) {
			d3.selectAll("circle").each(function(d) {
				node = d3.select(this);
				node.transition().duration(0);
				
				name = d.name.replace(".blogspot", "").replace(".wordpress", "").replace(".popo", "").replace("blogas", "").replace("blog", "").replace(".com", "").replace(".lt", "");
				
				if (name.indexOf(query) > -1) {
					for (var i = 0; i < 3; i++) {
						console.log(name)
						node.transition()
							.duration(TIME)
							.delay(2 * i * TIME)
							.attr("r", 1.3 * RADIUS * d.importance);
						
						node.transition()
							.duration(TIME)
							.delay((2 * i + 1) * TIME)
							.attr("r", RADIUS * d.importance);
					}
				}
			});
		}
	}
})(jQuery)