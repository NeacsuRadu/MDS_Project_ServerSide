
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.geometry.NodeOrientation;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.TextArea;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontPosture;
import javafx.scene.text.FontWeight;
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
    private String friendUsername;
    
    @FXML private TextArea chatMessage;
    @FXML private ScrollPane scrollPane;
    @FXML private ListView<Pane> some; 
    
    public void init()
    {
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
    }
    
    public void chatPressSendMessage(ActionEvent e)
    {        
        String message = new String(chatMessage.getText());
        chatMessage.setText("");
        if (message.equals(""))
        {
            return;
        }
        writeUserLine(message);
        mainController.sendMessage(MessageHandler.getInstance().getSendMessageMessage(mainController.getUsername(), friendUsername, message));
    }
    
    public void setMainController(MainController mainController)
    {
        this.mainController = mainController;
    }
    
    public void setFriendUsername(String friendUsername)
    {
        this.friendUsername = friendUsername;
    }
    
    public void showMessage(String message)
    {
        writeFriendLine(message);
    }
    
    public void writeUserLine(String message)
    {
        Pane element = new Pane();
        Label text = new Label();
        text.setText(message);
        text.setStyle("-fx-background-color: #c7d3e5;");
        element.getChildren().add(text);
        element.setScaleShape(true);
        element.setNodeOrientation(NodeOrientation.LEFT_TO_RIGHT);
        some.getItems().add(element);
    }
    
    public void writeFriendLine(String message)
    {
        Pane element = new Pane();
        Label text = new Label();
        text.setText(message);
        text.setStyle("-fx-background-color: #a7f9b9;");
        element.getChildren().add(text);
        element.setScaleShape(true);
        element.setNodeOrientation(NodeOrientation.RIGHT_TO_LEFT);
        some.getItems().add(element);
    }
}
