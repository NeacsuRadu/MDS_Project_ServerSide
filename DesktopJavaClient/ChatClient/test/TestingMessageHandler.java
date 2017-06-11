// Test MessageHandler Class

// Unit Testing(test functions) 

import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.BeforeClass;


public class TestingMessageHandler {
    
    private static MessageHandler mh = null;
    private static String signString;
    private static String regString;
    private static String logoutString;
    
    
    @BeforeClass
    public static void setUpClass() {
        
        mh = MessageHandler.getInstance();
        
        signString = "{\"data\":{\"password\":\"123456\",\"username\":\"user\"},\"type\":1}";
        regString = "{\"data\":{\"lastName\":\"lname\",\"firstname\":\"fname\","
                + "\"password\":\"pass123\",\"username\":\"uname\"},\"type\":2}";
        logoutString = "{\"data\":{\"username\":\"uname\"},\"type\":10}";
        
        user  = "user";
        pass  = "123456";
        firstname = "fname";
        lastname  = "lname";
        username  = "uname";
        password  = "pass123";
    }
    
        
    private static String user;
    private static String pass;
    
    @Test
    public void testGetSignInMessage() {
        
      //  String message = mh.getSignInMessage(user, pass);
        
       // Assert.assertTrue(message.equals(signString));
    }
    
    private static String firstname;
    private static String lastname;
    private static String username;
    private static String password;
   
    @Test
    public void testGetRegisterMessage() {
        
       // String message = mh.getRegisterMessage(firstname, lastname, username, password);
        
       // Assert.assertTrue(message.equals(regString));
    }
    
    @Test
    public void testGetLogOutMessage() {
        
        String message = mh.getLogOutMessage(username);
        
        Assert.assertTrue(message.equals(logoutString));
    }
    
    
}