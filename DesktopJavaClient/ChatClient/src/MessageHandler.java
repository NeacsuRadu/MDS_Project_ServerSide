
import java.util.ArrayList;
import org.json.JSONObject;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author Radu-Stefan Neacsu
 */
public class MessageHandler 
{
    // ------ SINGLETON ------ //
   
    private static MessageHandler instance = null;
    public static MessageHandler getInstance()
    {
        if (instance == null)
        {
            instance = new MessageHandler();
        }
        return instance;
    }
    
    private MessageHandler()
    {
        
    }
    
    // ------ HANDLERS ------ // 
    private ArrayList<MessageEvents> handlers;
    
    public synchronized void addHandler(MessageEvents handler)
    {
        handlers.add(handler);
    }
    
    // ------ MESSAGE CODES ------ // 
    
    final private int SIGN_IN = 1;
    final private int REGISTER = 2;
    
    
    // ------ SENDING MESSAGES ------ // 
    
    public String getSignInMessage(String username, String password)
    {
        JSONObject message = new JSONObject();
        JSONObject messageData = new JSONObject();
        messageData.put("username", username);
        messageData.put("password", password);
        
        message.put("type", SIGN_IN);
        message.put("data", messageData);
        return message.toString();
    }
    
    public String getRegisterMessage(String firstName, String lastName, String username, String password)
    {
        JSONObject message = new JSONObject();
        JSONObject messageData = new JSONObject();
        messageData.put("firstname", firstName);
        messageData.put("lastName", lastName);
        messageData.put("username", username);
        messageData.put("password", password);
        
        message.put("type", SIGN_IN);
        message.put("data", messageData);
        return message.toString();
    }
    
    // ------ HANDLING MESSAGES ------ //
    
    public void handleMessage(String message)
    {
        JSONObject messageJSON = new JSONObject(message);
        int type = messageJSON.getInt("type");// TODO : add exception here 
        
        switch (type)
        {
            case SIGN_IN:
            {
                JSONObject messageData = messageJSON.getJSONObject("data");
                
                boolean valid = messageData.getBoolean("valid");
                if (valid)
                {
                    System.out.println("Merge");
                }
                else 
                {
                    System.out.println("Nu merge");
                }
                break;
            }
            case REGISTER:
            {
                JSONObject messageData = messageJSON.getJSONObject("data");
                
                boolean valid = messageData.getBoolean("valid");
                if (valid)
                {
                    System.out.println("Merge");
                }
                else 
                {
                    System.out.println("Nu merge");
                }
                break;
            }
            default:
            {
                break;
            }
        }
    }
}
