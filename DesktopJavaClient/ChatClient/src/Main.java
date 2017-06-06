/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

/**
 *
 * @author Radu-Stefan Neacsu
 */
public class Main extends Application {
    
    private Stage primaryStage;
    private FXMLLoader signInLoader;
    private Scene signInScene;
    
    @Override
    public void start(Stage stage) throws Exception 
    {
        primaryStage = stage;
        
        signInLoader = new FXMLLoader();
        signInLoader.setLocation(Main.class.getResource("SignInView.fxml"));
        signInScene = new Scene(signInLoader.load());
        
        primaryStage.setScene(signInScene);
        primaryStage.show();
    }

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        launch(args);
    }
    
}
