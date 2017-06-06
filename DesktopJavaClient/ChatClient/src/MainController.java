
import java.util.ArrayList;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author Radu-Stefan Neacsu
 */
public interface MainController 
{
    public void showSignInView();
    public void showRegisterView();
    public void showAppView();
    
    public void sendMessage(String message);
    
    // ------ SIGN EVENTS ------ //
    
    public void signInFailed();
    public void signInSucceded(UserData userData, ArrayList<Friend> userFriends);
    
    // ------ REGISTER EVENTS ------ // 
    
    public void registerFailed();
    public void registerSucceded();
}
