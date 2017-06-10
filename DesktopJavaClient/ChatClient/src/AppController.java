
import java.util.ArrayList;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.scene.Group;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.CornerRadii;
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
 * @author Alex
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
    private ListView<Pane> mainListView, mainFriendsRequests;
    @FXML
    private Label mainErrors;
    
    public void mainAddFriend(ActionEvent e)
    {
        mainErrors.setText("");
        String name = new String(mainFriendUsername.getText());
        
        if(name.equals("") || 
           friendAlreayExists(name))
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
        mainController.sendMessage(MessageHandler.getInstance().getLogOutMessage(userData.getUsername()));
        mainController.showSignInView();
    }
    
    public void setMainController(MainController controller)
    {
        this.mainController = controller;
    }
    
    public void initView()
    {
        mainFriendUsername.setText("");
        mainErrors.setText("");
        
        mainListView.getItems().clear();
        mainFriendsRequests.getItems().clear();
        
        addFriendsInListView();
        addFriendRequestInListView();
        // aici parcurgem arrayList-ul ala si vedem care-s online is care nu :D 
    }
    
    private void addFriendsInListView()
    {
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
    }
    
    public void signInSucceeded(UserData userData, ArrayList<Friend> friends, ArrayList<String> friendRequests)
    {
        this.userData = userData;
        this.friends = friends;
        this.friendRequests = friendRequests;
    }
    
    public void updateFriends(String username, boolean online)
    {
        Friend friend = new Friend(username, online);
        boolean ok = true;
        for(int i = 0; i < friends.size(); i++)
        {
            if(friends.get(i).getUsername().equals(username))
            {
                friends.get(i).setOnlineState(online);
                ok = false;
            }
        }
        if(ok)
        {
            friends.add(friend);
        }
        
        mainListView.getItems().clear();
        addFriendsInListView();
    }
    
    private void addFriendRequestInListView()
    {
        for(int i = 0; i < friendRequests.size(); i++)
        {
            Group group = new Group();
            Pane pane = new Pane(group);
            Button button1 = new Button("Accept");
            button1.setBackground(new Background(new BackgroundFill(Color.GREEN, CornerRadii.EMPTY, Insets.EMPTY)));
            button1.setLayoutX(5);
            button1.setLayoutY(0);
            button1.setOnAction((event) -> 
            {
                String friendName = ((Button)event.getSource()).getParent().getChildrenUnmodifiable().get(2).getId();
                mainController.sendMessage(MessageHandler.getInstance().getFriendRequestAnswerMessage(userData.getUsername(), friendName, true));
                friendRequests.remove(friendName);
                mainFriendsRequests.getItems().clear();
                addFriendRequestInListView();
            });

            group.getChildren().add(button1);

            Button button2 = new Button("Reject");
            button2.setBackground(new Background(new BackgroundFill(Color.RED, CornerRadii.EMPTY, Insets.EMPTY)));
            button2.setLayoutX(60);
            button2.setLayoutY(0);
            button2.setOnAction((event) -> {
                String friendName = new String (((Button)event.getSource()).getParent().getChildrenUnmodifiable().get(2).getId());
                mainController.sendMessage(MessageHandler.getInstance().getFriendRequestAnswerMessage(userData.getUsername(), friendName, false));
                friendRequests.remove(friendName);
                mainFriendsRequests.getItems().clear();
                addFriendRequestInListView();
            });
            group.getChildren().add(button2);

            Label label = new Label(friendRequests.get(i));
            label.setId(friendRequests.get(i));
            label.setLayoutX(130);
            label.setLayoutY(0);
            group.getChildren().add(label);

            mainFriendsRequests.getItems().add(pane);
        }
    }
    
    public void addFriendRequest(String username)
    {
        if (friendRequests.contains(username))
        {
            return;
        }
        friendRequests.add(username);
        mainFriendsRequests.getItems().clear();
        addFriendRequestInListView();
    }
    
    public void friendRequestFailed()
    {
        mainErrors.setText("Request failed!");
    }
    
    public boolean friendAlreayExists(String username)
    {
        for (int i = 0; i < friends.size(); ++i)
        {
            if (friends.get(i).getUsername().equals(username))
                return true;
        }
        return false;
    }
}
