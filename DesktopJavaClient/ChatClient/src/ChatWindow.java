
import java.io.IOException;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Modality;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;

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
    
    public void close()
    {
        stage.close();
    }
    
    public boolean createWindow()
    {
        boolean bRes = true;
        try
        {
            fxmlLoader.setLocation(Main.class.getResource("NewChatView.fxml"));
            Parent root = fxmlLoader.load();
            chatController = fxmlLoader.getController();
            chatController.setMainController(main);
            chatController.setFriendUsername(username);
            chatController.init();
            
            stage.setTitle(username);
            stage.initModality(Modality.NONE);
            stage.initOwner(main.getStage());
            
            scene = new Scene(root);
            stage.setOnCloseRequest(new EventHandler<WindowEvent>() 
            {
                public void handle(WindowEvent we)
                {
                    main.removeWindow(username);
                }
            });
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
    
    public void requestFocus()
    {
        if (stage.isFocused())
            return;
        stage.requestFocus();
    }
}
