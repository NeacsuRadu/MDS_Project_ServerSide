
import java.util.ArrayList;
import org.json.JSONArray;
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
        handlers = new ArrayList<>();
    }
    
    // ------ HANDLERS ------ // 
    private ArrayList<MainController> handlers;
    
    public synchronized void addHandler(MainController handler)
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
                    UserData user = new UserData(messageData.getString("username"), messageData.getString("firstname"), messageData.getString("lastname"));
                    ArrayList<Friend> friends = new ArrayList();
                    JSONArray friendsArray = messageData.getJSONArray("friends");
                    
                    for (int i = 0; i < friendsArray.length(); ++i)
                    {
                        JSONObject fr = friendsArray.getJSONObject(i);
                        friends.add(new Friend(fr.getString("username"), fr.getBoolean("online")));
                    }
                    for (MainController handler : handlers)
                    {
                        handler.signInSucceded(user, friends);
                    }
                }
                else 
                {
                    for (MainController handler : handlers)
                    {
                        handler.signInFailed();
                    }
                }
                break;
            }
            case REGISTER:
            {
                JSONObject messageData = messageJSON.getJSONObject("data");
                
                boolean valid = messageData.getBoolean("valid");
                if (valid)
                {
                    for (MainController handler : handlers)
                    {
                        handler.registerSucceded();
                    }
                }
                else 
                {
                    for (MainController handler : handlers)
                    {
                        handler.registerFailed();
                    }
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
