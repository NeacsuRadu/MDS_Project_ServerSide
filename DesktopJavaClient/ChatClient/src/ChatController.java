
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.TextArea;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontPosture;
import javafx.scene.text.Text;
import javafx.scene.text.TextFlow;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author Alex
 */
public class ChatController 
{
    private MainController mainController;
    private String usernameFriend;
    
    @FXML 
    private TextArea chatMessage;
    
    @FXML
    private TextFlow chatHistory;
            
    public void chatPressSendMessage(ActionEvent e)
    {
        String message = new String(chatMessage.getText());
        chatMessage.setText("");
        if(message.equals(""))
        {
            return;
        }
        userToFriend(message);
        mainController.sendMessage(MessageHandler.getInstance().getSendMessageMessage(mainController.getUsername(), usernameFriend, message));
            
    }
    
    public void setMainController(MainController mainController)
    {
        this.mainController = mainController;
    }
    
    public void setUsernameController(String usernameFriend)
    {
        this.usernameFriend = usernameFriend;
    }
    
    public void showMessage(String message, String username_from)
    {
        
    }
    
    public void userToFriend(String message)
    {
        Text text = new Text(message);
        text.setFill(Color.BLUE);
        text.setFont(Font.font("Helvetica", FontPosture.ITALIC, 40));
        chatHistory.getChildren().add(text);
    }
    
    public void friendToUser(String message)
    {
        Text text = new Text(message);
        text.setFill(Color.RED);
        text.setFont(Font.font("Helvetica", FontPosture.ITALIC, 40));
        chatHistory.getChildren().add(text);
    }
    
}
