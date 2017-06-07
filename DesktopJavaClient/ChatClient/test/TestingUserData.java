import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author Costi
 */

public class TestingUserData {
    
    private static UserData ud = null;
    private static String username;
    private static String firstname;
    private static String lastname;
    
    @BeforeClass
    public static void setUpClass() {
        
        TestingUserData.username  = "user";
        TestingUserData.firstname = "name";
        TestingUserData.lastname  = "lname"; 
        TestingUserData.ud = new UserData(username, firstname, lastname);
    }
    
    @Test
    public void testUserData() {
        
        Assert.assertTrue(ud.getUsername().equals(username));
        Assert.assertTrue(ud.getFirstname().equals(firstname));
        Assert.assertTrue(ud.getLastname().equals(lastname));
    }

 }
