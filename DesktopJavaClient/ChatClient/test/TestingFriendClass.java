// Testing class Friend


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
public class TestingFriendClass {
    
    @Test
    public void testFriendClassConstructor() {
        
        String username = "newuser";
        boolean online = true;
        
        Friend fr = new Friend(username, online);
        
        Assert.assertTrue(fr.getUsername().equals(username));
        Assert.assertTrue(fr.isOnline() == true);
        
    }
    
    @Test
    public void testFunctionSetOnline() {
        
        String username = "newuser";
        boolean online = false;
        
        Friend fr = new Friend(username, online);
        
        Assert.assertTrue(fr.isOnline() == false);
        
        fr.setOnlineState(true);
        
        Assert.assertTrue(fr.isOnline() == true);
        
    }
    
}


