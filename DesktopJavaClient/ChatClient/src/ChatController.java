
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.TextArea;

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
    
    @FXML 
    private TextArea chatHistory, chatMessage;
    
    public void chatPressSendMessage(ActionEvent e)
    {
        
    }
    
    public void setMainController(MainController mainController)
    {
        this.mainController = mainController;
    }
    
    public void showMessage(String message, String username_from)
    {
        
    }
}
