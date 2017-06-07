
import java.util.ArrayList;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.Group;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;

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
    
    @FXML
    private TextField mainFriendUsername;
    @FXML
    private ListView<Pane> mainListView;
    @FXML
    private Label mainErrors;
    
    public void mainAddFriend(ActionEvent e)
    {
        String name = new String(mainFriendUsername.getText());
        
        if(name.equals(""))
        {
            friendRequestFailed();
        }
        else
        {
            mainController.sendMessage(MessageHandler.getInstance().getFriendRequestMessage(userData.getUsername(), name));
        }
        
        
    }
    
    public void mainSignOut(ActionEvent e)
    {
        
    }
    
    public void setMainController(MainController controller)
    {
        this.mainController = controller;
    }
    
    public void initView()
    {
        mainFriendUsername.setText("");
        mainErrors.setText("");
        
        for(int i = 0; i < friends.size(); i++)
        {
            Group group = new Group();
            Pane pane = new Pane(group);
            Circle circle = new Circle(4, 4, 6);

            if(friends.get(i).isOnline())
            {
                circle.setFill(Color.GREEN);
            }
            else
            {
                circle.setFill(Color.RED);
            }
            group.getChildren().add(circle);
            Label label = new Label();
            label.setText(friends.get(i).getUsername());
            label.setLayoutX(14);
            label.setLayoutY(-4);
            group.getChildren().add(label);

            mainListView.getItems().add(pane);
        }
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
        mainErrors.setText("Request failed!");
    }
    
}
