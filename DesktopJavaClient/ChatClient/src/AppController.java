
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
public class AppController 
{
    private MainController mainController = null;
    private ArrayList<Friend> friends;
    private ArrayList<String> friendRequests;
    private UserData userData;
    
    public void setMainController(MainController controller)
    {
        this.mainController = controller;
    }
    
    public void initView()
    {
        // aici parcurgem arrayList-ul ala si vedem care-s online is care nu :D 
    }
    
    public void signInSucceeded(UserData userData, ArrayList<Friend> friends, ArrayList<String> friendRequests)
    {
        this.userData = userData;
        this.friends = friends;
        this.friendRequests = friendRequests;
    }
    
    public void updateFriends(String username, boolean online)
    {
        
    }
    
    public void addFriendRequest(String username)
    {
        
    }
    
    public void friendRequestFailed()
    {
        
    }
    
}
