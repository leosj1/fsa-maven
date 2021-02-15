<%@page contentType="text/html" pageEncoding="UTF-8"%>

<%@page import="myclasses.NetworkLoader"%>
<%@page import="util.*"%>
<%@page import="authentication.*"%>
<%@ page import="java.io.*"%>
<%@page import="java.util.*"%>
<%@ page import="myclasses.NetworkGraph"%>
<%@ page import="myclasses.NetworkLoader"%>
<%@ page import="myclasses.FocalStructures"%>
<%@ page import="edu.ualr.fsa.*"%>
<%@ page import="org.json.JSONObject"%>
<%@ page import="org.json.JSONArray"%>
<%@ page import="org.json.simple.parser.JSONParser"%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%
String networkIdString = request.getParameter("networkId");
String groups = request.getParameter("groups");  

Object session_object = (null == session.getAttribute("original_fsa_groups_" + networkIdString)) ? "" : session.getAttribute("original_fsa_groups_" + networkIdString);
if(groups == ""){
 %>

        	<h3>Network Groups (FSA 2.0)</h3>
        	<form action="" method="">
        		<%
        			if(session_object != ""){
        				String [] groups_splitted = session_object.toString().replace("[", "").replace("]", "").trim().split(",");
        				for(String grp: groups_splitted){
        					grp = grp.trim();
        					String grp_ = "";
        					if(grp.equals("0")){
        						grp_ = "NO FSA";
        					}else{
        						grp_ = grp;
        					}
        				%>
        				<input type="checkbox" name="FSA_<%=grp%>" id="FSA_<%=grp%>" value="FSA_<%=grp%>">
        				<label for="FSA_<%=grp%>"><%=grp_%></label>
        			<%}
        			}
        		%>
			  
			</form>

<%}else {
	Object session_network_object = (null == session.getAttribute("original_fsa_network_" + networkIdString)) ? "" : session.getAttribute("original_fsa_network_" + networkIdString);
	JSONObject filtered_network_json = new JSONObject();
	JSONArray fltered_links = new JSONArray();
	JSONArray fltered_nodes = new JSONArray();
	if(session_network_object != ""){
		groups = groups.substring(0, groups.length() - 1);
		JSONObject network_json = new JSONObject(session_network_object.toString());
		JSONArray network_links = (JSONArray) network_json.get("links");
		JSONArray network_nodes = (JSONArray) network_json.get("nodes");
		
		HashSet<String> source_target = new HashSet<>();
		//Filter links out with selected FSAs
		for(String group: groups.split(",")){
			if(group.indexOf("FSA_") != -1){
				String grp = group.split("FSA_")[1];
				for(int i = 0; i < network_links.length(); i++){
					JSONObject link_data = new JSONObject(network_links.get(i).toString());
					if(link_data.get("group").equals(Integer.parseInt(grp))){
						fltered_links.put(link_data);
						
						source_target.add(link_data.get("source").toString());
						source_target.add(link_data.get("target").toString());
					}
				}
			}
		}
		
		//Filter nodes out with selected FSAs
		HashMap<Integer, Integer> nodes_table = new HashMap<>();
		int n = 0;
		for(int i = 0; i < network_nodes.length(); i++){
			if(source_target.contains(String.valueOf(i))){
				JSONObject node_data = new JSONObject(network_nodes.get(i).toString());
				fltered_nodes.put(node_data);
				nodes_table.put(i, n);
				n++;
			}
		}
		
		//Restructure index for d3 graph sake
		JSONArray final_fltered_links = new JSONArray();
		for(int i = 0; i < fltered_links.length(); i++){
			JSONObject final_link_data = new JSONObject(fltered_links.get(i).toString());
			String new_q = "{\"source\":"+ nodes_table.get(final_link_data.get("source")) +", \"target\": "+ nodes_table.get(final_link_data.get("target")) +", \"group\": "+ final_link_data.get("group") +" }";
			JSONObject new_final_link_data = new JSONObject(new_q);
			final_fltered_links.put(new_final_link_data);
		}
		
		JSONArray graphInfoArray = new JSONArray();
        JSONObject graphInfoJSONObject = new JSONObject();
        graphInfoJSONObject.put("numNodes", source_target.size());
        graphInfoJSONObject.put("numEdges", final_fltered_links.length());
        graphInfoJSONObject.put("responseMessage", "");
        graphInfoArray.put(graphInfoJSONObject);
        filtered_network_json.put("graphInfo",graphInfoArray);
		
		filtered_network_json.put("links", final_fltered_links);
		filtered_network_json.put("nodes", fltered_nodes);
		//System.out.println("filtered_network_json---" + filtered_network_json);
		
	}
	
	
	//System.out.println("groups---" + groups);%>
	<%=filtered_network_json%>
	
<%}%>