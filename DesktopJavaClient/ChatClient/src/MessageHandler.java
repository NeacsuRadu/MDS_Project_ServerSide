
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
    final private int SEND_FRIEND_REQUEST = 4;
    final private int SEND_FRIEND_REQUEST_ANSWER = 5;
    final private int SEND_MESSAGE = 8;
    final private int LOGOUT = 10;
    
    final private int FRIEND_REQUEST = 6;
    final private int FRIEND_REQUEST_FAILED = 7;
    final private int UPDATE_FRIENDS = 3;
    final private int RECEIVE_MESSAGE = 9;
    
    // ------ SENDING MESSAGES ------ // 
    
    public String getSignInMessage(String username, int password)
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
        
        message.put("type", REGISTER);
        message.put("data", messageData);
        return message.toString();
    }
    
    public String getFriendRequestMessage(String username_from, String username_to)
    {
        JSONObject message = new JSONObject();
        JSONObject messageData = new JSONObject();
        messageData.put("from", username_from);
        messageData.put("to", username_to);
        
        message.put("type", SEND_FRIEND_REQUEST);
        message.put("data", messageData);
        return message.toString();
    }
    
    public String getFriendRequestAnswerMessage(String username_from, String username_to, boolean accept)
    {
        JSONObject message = new JSONObject();
        JSONObject messageData = new JSONObject();
        messageData.put("from", username_from);
        messageData.put("to", username_to);
        messageData.put("accept", accept);
        
        message.put("type", SEND_FRIEND_REQUEST_ANSWER);
        message.put("data", messageData);
        return message.toString();
    }
    
    public String getLogOutMessage(String username)
    {
        JSONObject message = new JSONObject();
        JSONObject messageData = new JSONObject();
        messageData.put("username", username);
        
        message.put("type", LOGOUT);
        message.put("data", messageData);
        return message.toString();
    }
    
    public String getSendMessageMessage(String username_from, String username_to, String messageString)
    {
        JSONObject message = new JSONObject();
        JSONObject messageData = new JSONObject();
        messageData.put("from", username_from);
        messageData.put("to", username_to);
        messageData.put("message", messageString);
        
        message.put("type", SEND_MESSAGE);
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
                System.out.println("SIGN_IN case ");
                JSONObject messageData = messageJSON.getJSONObject("data");
                
                boolean valid = messageData.getBoolean("valid");
                if (valid)
                {
                    System.out.println("Valid");
                    UserData user = new UserData(messageData.getString("username"), "", "");
                    
                    ArrayList<Friend> friends = new ArrayList();
                    JSONArray friendsArray = messageData.getJSONArray("friends");
                    for (int i = 0; i < friendsArray.length(); ++i)
                    {
                        JSONObject fr = friendsArray.getJSONObject(i);
                        friends.add(new Friend(fr.getString("username"), fr.getBoolean("online")));
                    }
                    
                    ArrayList<String> friendRequests = new ArrayList();
                    JSONArray friendRequestsArray = messageData.getJSONArray("requests");
                    for (int i = 0; i < friendRequestsArray.length(); ++i )
                    {
                        JSONObject req = friendRequestsArray.getJSONObject(i);
                        friendRequests.add(req.getString("username"));
                    }
                    
                    for (MainController handler : handlers)
                    {
                        handler.signInSucceded(user, friends, friendRequests);
                    }
                }
                else 
                {
                    System.out.println("Not valid");
                    for (MainController handler : handlers)
                    {
                        handler.signInFailed();
                    }
                }
                break;
            }
            case REGISTER:
            {
                System.out.println("REGISTER case");
                JSONObject messageData = messageJSON.getJSONObject("data");
                
                boolean valid = messageData.getBoolean("valid");
                if (valid)
                {
                    System.out.println("valid");
                    for (MainController handler : handlers)
                    {
                        handler.registerSucceded();
                    }
                }
                else 
                {
                    System.out.println("invalid");
                    for (MainController handler : handlers)
                    {
                        handler.registerFailed();
                    }
                }
                break;
            }
            case UPDATE_FRIENDS:
            {
                System.out.println("UPDATE_FRIENDS case");
                JSONObject messageData = messageJSON.getJSONObject("data");
                
                String username = messageData.getString("username");
                boolean online = messageData.getBoolean("online");
                for (MainController handler : handlers)
                {
                    handler.updateFriends(username, online);
                }
                break;
            }
            case FRIEND_REQUEST:
            {
                System.out.println("FRIEND_REQUEST case");
                JSONObject messageData = messageJSON.getJSONObject("data");
                
                String username = messageData.getString("username");
                for (MainController handler : handlers)
                {
                    //handler.addFriendRequest(username);
                    handler.messageReceived(username, " ");
                }
                break;
            }
            case FRIEND_REQUEST_FAILED:
            {
                System.out.println("FRIEND_REQUEST_FAILED case");
                for (MainController handler : handlers)
                {
                    handler.friendRequestFailed();
                }
                break;
            }
            case RECEIVE_MESSAGE:
            {
                System.out.println("RECEIVE_MESSAGE case");
                JSONObject messageData = messageJSON.getJSONObject("data");
                
                String username_from = messageData.getString("from");
                String messageString = messageData.getString("message");
                
                for (MainController handler : handlers)
                {
                    handler.messageReceived(username_from, message);
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
