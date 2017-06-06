/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import java.util.Scanner;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.json.JSONObject;

/**
 *
 * @author Radu-Stefan Neacsu
 */
public class Main extends Application 
{
    
    private Stage primaryStage;
    private FXMLLoader signInLoader;
    private Scene signInScene;
    
    private ClientSocket clientSocket = null;
    
    @Override
    public void start(Stage stage) throws Exception 
    {
        primaryStage = stage;
        
        signInLoader = new FXMLLoader();
        signInLoader.setLocation(Main.class.getResource("SignInView.fxml"));
        signInScene = new Scene(signInLoader.load());
        
        primaryStage.setScene(signInScene);
        primaryStage.show();
        
        JSONObject ob = new JSONObject();
        
        initialize();
        
    }
    
    void initialize()
    {
        this.clientSocket = new ClientSocket();
        if (!clientSocket.init())
        {
            clientSocket = null;
            System.out.println("Could not initialize socket");
        }
        else 
        {
            clientSocket.startListening();
        }
    }
    
    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) 
    {
        launch(args);
    }
    
}
