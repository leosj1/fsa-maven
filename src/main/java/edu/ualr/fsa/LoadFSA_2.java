package edu.ualr.fsa;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.JSONObject;
import org.json.JSONArray;

import authentication.DbConnection;
import myclasses.FocalStructures;
import myclasses.NetworkGraph;
import myclasses.NetworkLoader;


/**
 * Servlet implementation class LoadFSAServlet
 */
@WebServlet("/load/fsa/2.0")
public class LoadFSA_2 extends HttpServlet {
    // TODO What Servlet specs: serialVersionUID, @Override, etc.
    private static final long serialVersionUID = 1L;
    /**
     * @see HttpServlet#HttpServlet()
     */
    public LoadFSA_2() {
        super();
        // TODO Auto-generated constructor stub
    }
    HashMap<String, String> hm = DbConnection.loadConstant();		
	
	String api_url = hm.get("api_url");
    
	
	public String _getResult(String url, JSONObject jsonObj) throws Exception {
		new ArrayList<String>();
		JSONObject myResponse = new JSONObject();
		String out = null;
		try {
			URL obj = new URL(url);
			HttpURLConnection con = (HttpURLConnection) obj.openConnection();

			con.setDoOutput(true);
			con.setDoInput(true);

			con.setRequestProperty("Content-Type", "application/json; charset=utf-32");
			con.setRequestProperty("Content-Type", "application/json");
			con.setRequestProperty("Accept-Charset", "UTF-32");
			con.setRequestProperty("Accept", "application/json");
			con.setRequestMethod("POST");

			DataOutputStream wr = new DataOutputStream(con.getOutputStream());

			// OutputStreamWriter wr1 = new OutputStreamWriter(con.getOutputStream());
			wr.write(jsonObj.toString().getBytes());
			wr.flush();

			con.getResponseCode();
			BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
			String inputLine;
			StringBuffer response = new StringBuffer();

			while ((inputLine = in.readLine()) != null) {
				response.append(inputLine);
			}
			in.close();

			myResponse = new JSONObject(response.toString());
			out = myResponse.toString();

		} catch (Exception ex) {
		}
		return out;

	}

    /**
    * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
    */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws 
    ServletException, IOException {

    	NetworkDAO networkDAO = new NetworkDAO();
        DbConnection ds = new DbConnection();
        try {
        	String networkIdString = request.getParameter("networkId");
            Long networkId = Long.parseLong(networkIdString);
            JSONObject networkJSONObjectOutput = new JSONObject();
            HashSet<Integer> fsa_groups = new HashSet<>();
            
            HttpSession session = request.getSession();
            Object session_object = (null == session.getAttribute("original_fsa_network_" + networkIdString)) ? "" : session.getAttribute("original_fsa_network_" + networkIdString);
            if(session_object == "") {
            	// NetworkDAO
                Hashtable<String, String> vertexLabelTable = networkDAO.getNodes(networkId);
                List<String> edgeList = networkDAO.getEdges(networkId);
                ArrayList<String> edgeListArray = new ArrayList<String>(edgeList);

                NetworkGraph networkGraph = NetworkLoader.LoadResultSet(vertexLabelTable, edgeListArray);
                networkGraph.setNetworkGraph(networkGraph);

                // Create FSA Unweighted graph
                String url = api_url + "/fsa_computation";
            	String str = "{\r\n" + 
            			"    \"network_id\":"+networkIdString+"\r\n" + 
            			"}";
            	
            	JSONObject js = new JSONObject(str);
            	//JSONObject networkJSONObjectOutput = new JSONObject();
            	String fsa_result = _getResult(url, js).toString();
            	
            	Hashtable<String,Integer> fStructures = new Hashtable<>();
            	String fsa_result_cleaned = fsa_result.substring(1, fsa_result.length()-1).replace("\"","").trim();   
            	String[] keyValuePairs = fsa_result_cleaned.split(","); 
            	//System.out.println(fsa_result);
            	for(String pair : keyValuePairs)                        
            	{
            	    String[] entry = pair.split(":");
            	    int group = Integer.parseInt(entry[1].trim());
            	    fStructures.put(entry[0].trim(), group);   
            	    
            	    fsa_groups.add(group);
            	}
            	
                // Create JSON
                //networkJSONOutput = networkGraph.ToJSONString(fStructures.fStructuresIndexTable); // Fatih
                networkJSONObjectOutput = networkGraph.ToJSONObject2(fStructures);
                
                // Attach JSON representation of network as HTTP Response payload
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                if(networkJSONObjectOutput.length() > 0) {
                	session.setAttribute("original_fsa_network_" + networkIdString, networkJSONObjectOutput);
                	session.setAttribute("original_fsa_groups_" + networkIdString, fsa_groups);
                }
                response.getWriter().write(networkJSONObjectOutput.toString());
                System.out.println("here");
        	}else {
        		networkJSONObjectOutput = new JSONObject(session_object.toString());
        		response.setContentType("application/json");
        		response.setCharacterEncoding("UTF-8");
        		response.getWriter().write(networkJSONObjectOutput.toString());
        	}
        	
            
            

        } catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
}
