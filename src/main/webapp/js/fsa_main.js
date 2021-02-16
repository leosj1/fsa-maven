/**
 * JS page designed to work with alternate Servlet architecture fsa_index.jsp
 * @author Andrew Pyle <axpyle@ualr.edu> MS-Information Science 2018
 */


$(document).ready(function() {
//alert('here');
  /**
   * Page defaults
   */
  $("#loadingBar").hide();

  var visDiv = "div#d3vis";
  var networkJson = null;  // global scope for current network in memory
  var greyHexCode = "#808080"
  // var colorScale = d3.scaleOrdinal(d3.schemeCategory20);
  var colorScale = d3.scaleOrdinal([
    "#94002d",
    "#008fe6",  // Colors from i want hue
    "#3d9400",  // Developed by Mathieu Jacomy
    "#d9b600",  // at the Sciences-Po Medialab
    "#babeff",  // http://tools.medialab.sciences-po.fr/iwanthue/
    "#ff50a5",
    "#ffaad8",
    "#ebffe3",
    "#374500",
    "#4b0051",
    "#3f0600",
    "#b9ffb7",
    "#01e986",
    "#01cedd",
    "#01645d",
    "#002b66",
    "#f62a56",
    "#8246cb",
    "#bc5300",
    "#ffa26e"]);

  // Load Default Network
  //loadNetworkAjax("load/fsa/unweighted");
  //loadNetworkAjax("load/fsa/2.0");
  render_network("session");

  // Custom error message to throw if FSA groups are changed from
  // increment-b-5 to increment-by-1 server-side
  var FSAGroupError = new Error("Custom FSA Error from Andrew Pyle." +
    " This Error means that the stopgap mutation bandaid to" +
    " transform the FSA Group numbers from an increment-by-5 space" +
    " to an increment-by-1 space yielded a non-Integer number." +
    " This is likely because someone has finally changed the FSA" +
    " algorithm from incrementing the FSA groups by 5 to" +
    " incrementing them by 1 Congratulations! Just remove the call" +
    " to normalizeFSAGroup() on loadNetworkAjax() success.");

  /**
   * Apply Load Network Event Handlers
   */
  
  // TODO Make this the only database query
  // TODO Apply FSA properly (weighted/unweighted) the first time

  $("#networkList").change(function() {
      //loadNetworkAjax("load/fsa/unweighted");
	  //loadNetworkAjax("load/fsa/2.0");
	  $("#fsa_computation").val(1);
	  render_network("session");
  });
  
  $(".network_click").click(function() {
      //loadNetworkAjax("load/fsa/unweighted");
      //loadNetworkAjax("load/fsa/2.0");
	  //check_status_before_render()
	  render_network("session")
  });

  $("#applyFSAUnweighted").click(function() {
      loadNetworkAjax("load/fsa/unweighted");
  });

  $("#applyFSAWeighted").click(function() {
      loadNetworkAjax("load/fsa/weighted");
  });
  
  $("#applyFSA2").click(function() {
	  alert('Are you sure you want to run 2.0 ?')
      loadNetworkAjax("load/fsa/2.0");
	  update_status_bar()
  });
  
//  $("#CSVExport").click(function() {
//      loadNetworkAjax("load/fsa/2.0");
//  });
 
  //Filter FSA by Groups
  $("#groups_fsa").click(function() {
	  var groups_string = "";
	  $("input:checkbox").each(function() {
	      if ($(this).is(":checked")) {
	    	  groups_string+= $(this).attr("id") + ",";
	      }else{
	      	//console.log($(this).attr("id"));
	      } 
	  });
	  $("#groups_fsa").val(groups_string);
	  
	  if(groups_string != ""){
		  render_network("render");
	  }
	  
  });
  
//Network Text Export
function download_fsa_csv(response, url){
	var nodeArr = response.nodes
	  var linkArr = response.links
	  var lines = [];
	  
	  if(url != "load/fsa/2.0"){
	  	nodeArr.forEach(function(val, idx) {
	          if (val.group != 0) {
	              lines.push([val.name, val.group]);
	          }
	      });
	  	// In-Place Sort by FSA Group.
	      // Lowest Non-Zero Group First.
	      lines.sort(function(a, b) {
	          return a[1] - b[1];
	      })
	   // Hardcoded CSV Header
	      var csvHeader = 'Node' + ',' + 'FSA Group' + '\n';
	      $("#CSVExport").attr("download", "Network_FSA" + $("#networkList").val() + ".csv");
	  }else{
		  console.log("download_fsa_csv", response);
	  	linkArr.forEach(function(val, idx) {
	          if (val.group != 0) {
	        	  if(val.source.hasOwnProperty('name')){
	        		  lines.push([val.source.name, val.target.name, val.group]);
	        	  }else{
	        		  lines.push([nodeArr[val.source].name, nodeArr[val.target].name, val.group]);
	        	  }           
	          }
	      });
	  	// In-Place Sort by FSA Group.
	      // Lowest Non-Zero Group First.
	      lines.sort(function(a, b) {
	          return a[2] - b[2];
	      })
	   // Hardcoded CSV Header
	      var csvHeader = 'Source' + ',' + 'Target' + ',' + 'Group'+ '\n';
	      $("#CSVExport").attr("download", "FSA_2_Network" + $("#networkList").val() + ".csv");
	  }
	  
	  var csvContent = lines.join('\n');  // CSV string
	  var csvFileStr = csvHeader + csvContent;
	  

	  // Download Link
	  link = $("#CSVExport");
	  link.attr(
	      'href', 'data:text/csv); charset=utf-8,' +
	      encodeURIComponent(csvFileStr)
	  );
}
	
  function render_network(action){
	  var groups = $("#groups_fsa").val();
	  if(action == "" || action == "session"){
		  groups = action;
	  }
	  console.log("action", action, "groups", groups);
  	$.ajax({
          type: "GET",
          url: "subpages/index_servlet.jsp",
          data: {
            "networkId": $("#networkList").val(),
            "groups":groups,
            "action": action
          }, 
          error: function(response) {
          	alert("error");
          },

          success: function(response) {
        	  if(action == ""){
        		  $("#groups_fsa").html(response);
        	  }
        	  if(action == "session"){
        		  if(String(response).trim() == "True"){
        			  console.log("session available")
        			  loadNetworkAjax("load/fsa/2.0");
        		  }else{
        			  console.log("no session available")
        			  loadNetworkAjax("load/fsa/2.0");
        			  update_status_bar();
        		  }
        	  }
        	  if(action == "render"){
        		  response = JSON.parse(response);
        		  //console.log("response", response);
        		  drawForceDirectedGraph(response, visDiv, colorScale, $("#filter_name").val());
        		// Info Table
                  var tbl = $("table#graphInfo");
                  tbl.empty() // Prevent repeating rows

                  var graphInfo = response.graphInfo[0];
                  //console.log("graphInfo", graphInfo);
                  var keys = Object.keys(graphInfo);
                  // console.log(graphInfo, keys);  // Debug
                  $.each(graphInfo, function(key, val) {
                      // Only show responseMessage if has value
                      if (val != "") {
                          tbl.append(
                              $('<tr>').append(
                                  $('<th>').text(key),
                                  $('<td>').text(val)
                              )
                          )
                      }
                  });     
        	  }
          	
          }

        });
  }
  
//  function check_status_before_render(){
//		session = render_network("session");
//		console.log("session--", session);
//		if(session == "True"){
//			alert('session')
//			//render_network("render");
//		}else{
////			loadNetworkAjax("load/fsa/2.0");
////			update_status_bar()
//		}
//	}
  
  /*
   * Function to update status bar
   */
     var i = 0;
  function update_status_bar() {
    if (i == 0) {
      i = 1;
      var elem = document.getElementById("myBar");
      var width = 10;
      var id = setInterval(frame, 1000);
      
      function frame() {
    	  var status_code = $("#fsa_computation").val();
          console.log("status_code", status_code);
        if (width >= 100 || status_code == "0") {
        	if(status_code == "0"){
        		alert('An error occurred while running the FSA v2.0 computaion. Please check the API log or if the API server is down');
        	}
      	    console.log("100", width)
            clearInterval(id);
            i = 0;
            
            
        } else {
      	  $.ajax({
                type: "GET",
                url: "Status",
                data: {
                    "networkId": $("#networkList").val()
                  },
                error: function(response) {console.log("error",response)},
                success: function(response) {
              	  width = parseInt(response);
              	  console.log("success", width)
                    elem.style.width = width + "%";
                    elem.innerHTML = width + "%";
                }
              });

        }
      }
    }
  }


    /**
     * Function Definitions
     */

    // Mutates Node Object in place
    function normalizeFSAGroup(nodeObj) {
        if (typeof nodeObj.group === 'number') {
            nodeObj.group === 0 ? 0 : nodeObj.group /= 5;

            // Compatibility check
            if (!Number.isInteger(nodeObj.group)) {
                throw FSAGroupError;
            }

        } else {
            throw TypeError('FSA Group from server is not a number.');
        }
    }

    
    function loadNetworkAjax(url) {

        // Ensure user can't submit a request before the first one returns.
        $(".FSAButtons").prop("disabled", true);

        if ($("#networkList").val() != "placeholder") {

            $("#loadingBar").show();

            var request = $.ajax({
              type: "GET",
              url: url,
              data: {
                "networkId": $("#networkList").val()
              },
              dataType: "json",

              error: function(response) {
                //console.log(response);
                alert("Error Loading FSA, Please login");
                $("#fsa_computation").val(0);
              },

              success: function(response) {
            	  //alert(url)
                // Mutate Node FSA Groups
                // from [0,5,10,...,N] -> [0,1,2,...,N]
//                response.nodes.forEach(function(nodeObj) {
//                    normalizeFSAGroup(nodeObj);
//                });

                // alert("Ajax success");  // Debug
                // $("div#d3vis").empty();
                drawForceDirectedGraph(response, visDiv, colorScale, $("#filter_name").val());

                // Info Table
                var tbl = $("table#graphInfo");
                tbl.empty() // Prevent repeating rows

                var graphInfo = response.graphInfo[0];
                //console.log("graphInfo", graphInfo);
                var keys = Object.keys(graphInfo);
                // console.log(graphInfo, keys);  // Debug
                $.each(graphInfo, function(key, val) {
                    // Only show responseMessage if has value
                    if (val != "") {
                        tbl.append(
                            $('<tr>').append(
                                $('<th>').text(key),
                                $('<td>').text(val)
                            )
                        )
                    }
                });
                //console.log("download_fsa_csv", response);
                download_fsa_csv(response, url);
              },
              complete: function() {
                  // Re-enable buttons once request returns
                  $(".FSAButtons").prop("disabled", false);
                  $("#loadingBar").hide();
                  render_network("");
              }

            });

            $("#loadingBar").hide();
        }
    }


  /**
   * D3 Force-Directed Graph
   * param: networkJson (JSON): nodes & links arrays
   * param: div (DOM selector string): div to draw SVG
   * param: colorScale (Array): D3 color scale to apply
   */
  function drawForceDirectedGraph(networkJson, div, colorScale, type) {
      //console.log("networkJson", networkJson);
      // Total Data
      var nodeData = null;
      var linkData = null;
      
      if(type != ""){
    	  alert('filtering nodes by group....');
      }else{
    	  nodeData = networkJson.nodes;
    	  linkData = networkJson.links;
      }
      
      
      // Check Network View Radio Buttons
      if ($('input#networkViewFSAOnly').is(':checked')) { // Render Exploded FSA Groups
          
          // Explode FSA Groups from entire network
    	  //alert('here')
          renderExplodedGraph(networkJson, colorScale);
      
      } else { // Render Entire Network
    	  //alert('here2')
          renderGraph(nodeData, linkData, colorScale);
      
      }


    function renderGraph(nodeData, linkData, colorScale) {
        // Clear div
        $(div).empty();
      
//    // Data
//    var nodeData = networkJson.nodes;
//    var linkData = networkJson.links;

    // Set up SVG div
    var width = "100%";
    var height = 900;  // TODO use viewport-based measurements

    var svg = d3.select(div)  // "div#svgHere"
        .attr("class", "svg-container")
        // .attr("style", "background-color: #eee;") // in CSS
      .append("svg")
        .attr("class", "svg-content")
        .attr("width", width)  // TODO Remove hardcode
        .attr("height", height); // TODO Remove hardcode

    // Separate layer for network so nodes and links zoom together
    var gNetworkBase = svg.append("g")
        .attr("class", "networkBase");

    // Draw links first so they're underneath nodes
    //alert('graph')
    
    var links = gNetworkBase.append("g")
        .attr("class", "links")
      .selectAll("line")  // SVG native element: line
        .data(linkData)
      .enter()  // TODO function() for exploded focal structures use .update()
        .append("line")
        .attr("stroke-width", 5)
        .style("stroke", applyFSAColor);

    // Drag Nodes
    var drag = d3.drag()
        .on("start", function(d) {
            if (!d3.event.active) {
                simulation.alphaTarget(0.9).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        })
        .on("drag", function(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        })
        .on("end", function(d) {
            if (!d3.event.active) {
                simulation.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
        })

    // Draw nodes on top of links
    //console.log("data", nodeData)
    var nodes = gNetworkBase.append("g")
        .attr("class", "nodes")
      .selectAll("circle")  // SVG native element: circle
        .data(nodeData)
      .enter()
        .append("circle")
        
        .on("mouseover", function(d) { return d.name })
        .attr("r", 10)
        //.attr("fill", applyFSAColor)
        .attr("fill", "black")
        
        .text(function(d) { return d.name })
        .call(drag);

    var nodeLabels = gNetworkBase.append("g")
        .attr("class", "nodeLabels")
      .selectAll("text")
        .data(nodeData)
      .enter()
        .append("text")
        .attr("dx", -5) // Slight offset to be in center
        .attr("dy", 5)  // FIXME Make this appear better
        .attr("visibility", "hidden")
        .text(function(d) { return d.name })
        .on("mouseover", function(d) { return d.name })
        // FIXME node labels scaled by zoom?
        .call(drag);

    var weightLabels = gNetworkBase.append("g")
        .attr("class", "weightLabels")
      .selectAll("text")
        .attr("class", "weightLabels")
        .data(linkData)
      .enter()
        .append("text")
        .attr("dx", -5) // Slight offset to be in center
        .attr("dy", 5)  // FIXME Make this appear better
        .attr("visibility", "hidden")
        .text(function(d) { return d.value });
   
    

    // d3.forceSimulation() creates simulation entities which will be
    // used to manipulate the position of the DOM entities on each tick
    //console.log("nodeData", nodeData);
    //console.log("linkData", linkData);
    var simulation = d3.forceSimulation()
        .nodes(nodeData)

        // Forces
        .force("charge", d3.forceManyBody())  // Nodes repels other nodes
        .force("center", d3.forceCenter(  // Creates center coordinates
            d3.select("svg.svg-content").node().getBoundingClientRect().width / 2,   // FIXME proper SVG boundaries
            d3.select("svg.svg-content").node().getBoundingClientRect().height / 2
         ))
        .force("links", d3.forceLink(linkData))  // Links have a length
        .force("collision", d3.forceCollide(nodes.attr("r"))) // Force radius == default node radius
        .force("xGravity", d3.forceX().strength(0.06))  // like gravity but
        .force("yGravity", d3.forceY().strength(0.06))  // toward origin

        // Decay Parameters
        .alphaDecay(0.08)  // default = 0.0228 = 1 - pow(0.001, 1 / 300)
        //.velocityDecay(0.2)  // default = 0.4

        // Tick
        .on("tick", function() {
            // Update SVG entity positions according to simulation
            nodes.attr("cx", function(d) { return d.x; })
                 .attr("cy", function(d) { return d.y; });

            links.attr("x1", function(d) { return d.source.x; })
                 .attr("y1", function(d) { return d.source.y; })
                 .attr("x2", function(d) { return d.target.x; })
                 .attr("y2", function(d) { return d.target.y; });

            nodeLabels.attr("x", function(d) { return d.x })
                      .attr("y", function(d) { return d.y });

            weightLabels
                .attr("x", function(d) {
                    return (d.source.x + d.target.x) / 2; })
                .attr("y", function(d) {
                    return (d.source.y + d.target.y) / 2; });
        });

    // Zoom & Pan entire SVG
    var zoom = d3.zoom().on("zoom", function() {
        // transform entire g element below nodes and links
        gNetworkBase.attr("transform", d3.event.transform)
    });
    zoom(svg); // TODO Apply with D3 .call()

    // Apply Visual Option Settings on Network Load
    applyVisualOptions();  // 0.
    

    /**
     * Visual Options
     */

    // Umbrella function for applying all visual options
    function applyVisualOptions() {
        nodeLabelState();
        weightLabelState();
        fsaColorState();
        linkWidthState();
        nodeRadiusState();
    }
    
    // Show Node Labels
    function nodeLabelState() {
        if ($("#chkCaption").is(":checked")) {
            nodeLabels.style("visibility", "visible");
        } else {
            nodeLabels.style("visibility", "hidden");
        }
    }
    
    // Checkbox event handler
    $("#chkCaption").change(function(event) {
        nodeLabelState();
    });


    // Show Weight labels
    function weightLabelState() {
        if ($("#chkEdgeWeight").is(":checked")) {
            weightLabels.style("visibility", "visible");
        } else {
            weightLabels.style("visibility", "hidden");
        }
    }

    // Checkbox event handler
    $("#chkEdgeWeight").change(function(event) {
        weightLabelState();
    });
    

    // Hide FSA Colors
    function fsaColorState() {
        if (!$("#chkNodeColor").is(":checked")) {
            nodes.attr("fill", "black");
        } else {
            nodes.attr("fill", greyHexCode);
        }
    }

    function applyFSAColor(d) {  // D3-style .attr function
        // Grey if not in focal structure
        if (d.group === 0) { return greyHexCode }
        // Color if in focal structure
        else { return colorScale(d.group) }
    }

    // Checkbox event handler
    $("#chkNodeColor").change(function(event) {
        fsaColorState();
    });

    
    // Link Width Proportional to Weight
    function linkWidthScale(domainMax) {
        return d3.scaleLinear().domain([1,domainMax]).range([2,15])
    }

    function linkWidthState() {
        // Calculate Max Link width for scaling
        var maxLinkValue = linkData.reduce(function(acc, cv) {
            return Math.max(acc, cv.value);
        }, 0)
        
        // D3-style .attr function to set link width
        var scaleLinkWidths = linkWidthScale(maxLinkValue);

        if ($("#chkLinkWidth").is(":checked")) {
            links.attr("stroke-width", function(d) {
                return scaleLinkWidths(d.value); 
            });
        } else {
            links.attr("stroke-width", 5);
        }
    }

    // Checkbox event handler
    $("#chkLinkWidth").change(function(event) {
        linkWidthState();
    });
    
    
    // Node Size Proportional to Degree
    function sumIncidentEdges(nodeData, linkData) {
        inc = [];
        nodeData.forEach(function(element, index) {
            inc.push(0)
            linkData.forEach(function(element) {
                if (element.source.index === index ||
                        element.target.index === index) {
                    inc[index] += 1;
                }
            })
        })
        return inc;
    }

    function getMaxIncidentEdges(arr) {
        return arr.reduce(function(a, b) { return Math.max(a,b); })
    }

    function nodeRadiusScale(domainMax) {
        return d3.scaleLinear().domain([1,domainMax]).range([5,20])
    }

    function nodeRadiusState() {

        // Calculate incident edge data for scaling
        var incidentEdgeArray = sumIncidentEdges(nodeData, linkData);
        var scaleNodes = nodeRadiusScale(
                getMaxIncidentEdges(incidentEdgeArray));

        if ($("#chkNodeRadius").is(":checked")) {
            nodes.attr("r", function(d) {
                return scaleNodes(incidentEdgeArray[d.index]);
            });
        } else {
            nodes.attr("r", 10);
        }
    }

    // Checkbox event handler
    $("#chkNodeRadius").change(function() {
        nodeRadiusState();
    })

  }
      
    // Explode FSA Groups from entire network
    function renderExplodedGraph(networkJson, colorScale){

      // Get "Exploded" data
    	//console.log('renderExplodedGraph', networkJson);
      var fsaNetwork = filterFSAGroups(networkJson);
    	
    	//var fsaNetwork = networkJson.nodes;
      
      // Split for renderGraph params
      var fsaNodes = fsaNetwork.nodes;
      var fsaLinks = fsaNetwork.links;
      
      //console.log("fsaNodes", fsaNodes)
      //console.log("fsaLinks", fsaLinks)
      
      // Draw FSA Groups only
      //console.log('renderExplodedGraph', networkJson);
      renderGraph(fsaNodes, fsaLinks, colorScale);
    }
    
    function filterFSAGroups(networkJson) {
        // Deep copy of networkJson to avoid mutation
    	//console.log('filterFSAGroups1', networkJson);
        var fsaNetworkJson = JSON.parse(JSON.stringify(networkJson));
        
        //console.log('fsaNetworkJson', fsaNetworkJson);
        //console.log('filterFSAGroups2', fsaNetworkJson);
        
        // Filter FSA Nodes
        var fsaNodes = fsaNetworkJson.nodes.filter(function(val) {
               return val.group != 0;
        });
        
        // List of FSA node names
        fsaNodeNameList = [];
        
        fsaNodes.forEach(function(val) {
            fsaNodeNameList.push(val.name);
        });
//        console.log("fsaNodeNameList", fsaNodeNameList);
        // Mutate JSON: key on names, rather than indices
        //console.log('fsaNetworkJson', fsaNetworkJson);
        //console.log('networkJson2', networkJson);
        
        fsaNetworkJson.links.forEach(function(val) {
            val.source = fsaNetworkJson.nodes[val.source].name;
            val.target = fsaNetworkJson.nodes[val.target].name;
        });
        
        
        // Remove non-FSA group links
        var fsaLinks = fsaNetworkJson.links.filter(function(val) {
            return isIntraGroupLink(val.source, val.target, fsaNetworkJson.nodes);
        });
        
        // Source & Target are in same group, and group is not 0
        function isIntraGroupLink(sourceNodeName, targetNodeName, nodesArray) {
            sourceGroup = nodesArray.find(function(val) {
                return val.name === sourceNodeName; 
            }).group;
            
            targetGroup = nodesArray.find(function(val) {
                return val.name === targetNodeName;
             }).group;
            
            return sourceGroup === targetGroup && sourceGroup != 0;
        }
        
        // Re-mutate links: key on indices, not names
        fsaLinks.forEach(function(val) {
//            val.source = fsaNodes.indexOf(val.source);
//            val.target = fsaNodes.indexOf(val.target);
            
            val.source = fsaNodes.findIndex(function(obj) {
                return obj.name === val.source;
            });
            
            val.target = fsaNodes.findIndex(function(obj) {
                return obj.name === val.target;
            })
            

        });
        
        
//        // Subset Data
//        var fsaNodes = [
//            {'name': 'echo', 'group':0},
//            {'name': 'PolitiDitz', 'group':0},
//            {'name': 'vinyardsaker', 'group':1}
//        ];
//        
//        var fsaLinks = [
//            {"source":0,"value":7.0,"target":1},
//            {"source":1,"value":7.0,"target":0},
//            {"source":1,"value":7.0,"target":2},
//        ];
        
        return { nodes: fsaNodes,
                 links: fsaLinks };
    }
  }

});
