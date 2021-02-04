package edu.ualr.fsa;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import authentication.DbConnection;
import myclasses.FocalStructures;
import myclasses.NetworkGraph;
import myclasses.NetworkLoader;


/**
 * Servlet implementation class LoadFSAServlet
 */
@WebServlet("/Status")
public class Status extends HttpServlet {
    // TODO What Servlet specs: serialVersionUID, @Override, etc.
    private static final long serialVersionUID = 1L;
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Status() {
        super();
        // TODO Auto-generated constructor stub
    }
    
    
	
	public String _getResult(String url) throws Exception {
		new ArrayList<String>();
		JSONObject myResponse = new JSONObject();
		String out = null;
		try {
			URL url1 = new URL(url);
			HttpURLConnection con = (HttpURLConnection) url1.openConnection();
			con.setRequestMethod("GET");
			con.getResponseCode();
			BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
			String inputLine;
			StringBuffer response = new StringBuffer();

			while ((inputLine = in.readLine()) != null) {
				response.append(inputLine);
			}
			in.close();
			out = response.toString();

		} catch (Exception ex) {
		}
		return out;

	}
	
	public static void main(String [] args) {
		Status s = new Status();
		try {
			s._getResult("http://144.167.35.125:5004/status");
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

    /**
    * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
    */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws 
    ServletException, IOException {

    	
    		String url = "http://144.167.35.125:5004/status";
    		String status = "";
    		try {
				status = _getResult(url).toString();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

            response.getWriter().write(status);
            System.out.println("here");
    }
}
