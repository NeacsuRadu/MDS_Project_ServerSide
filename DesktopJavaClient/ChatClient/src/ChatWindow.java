
import java.io.IOException;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Modality;
import javafx.stage.Stage;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author Radu-Stefan Neacsu
 */
public class ChatWindow 
{
    private Stage stage;
    private Scene scene;
    private FXMLLoader fxmlLoader;
    private ChatController chatController;
    private String username;
    private Main main;
    
    public ChatWindow(String username, Main main)
    {
        this.username = username;
        this.main = main;
        stage = new Stage();
        fxmlLoader = new FXMLLoader();
    }
    
    public boolean createWindow()
    {
        boolean bRes = true;
        try
        {
            fxmlLoader.setLocation(Main.class.getResource("ChatView.fxml"));
            Parent root = fxmlLoader.load();
            chatController = fxmlLoader.getController();
            chatController.setMainController(main);
            
            stage.setTitle(username);
            stage.initModality(Modality.NONE);
            stage.initOwner(main.getStage());
            
            scene = new Scene(root);
            stage.setScene(scene);
            stage.show();
        }
        catch(IOException ex)
        {
            bRes = false;
            System.out.println("CreateWindow error " + ex.getMessage());
        }
        return bRes;
    }
    
    public ChatController getController()
    {
        return this.chatController;
    }
}
