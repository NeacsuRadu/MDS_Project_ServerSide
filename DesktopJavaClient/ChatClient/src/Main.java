/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import java.util.Scanner;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.json.JSONObject;

/**
 *
 * @author Radu-Stefan Neacsu
 */
public class Main extends Application implements MainController
{
    private Stage primaryStage;
    
    private FXMLLoader signInLoader;
    private FXMLLoader registerLoader;
    private FXMLLoader mainLoader;
    
    private Scene signInScene;
    private Scene registerScene;
    private Scene mainScene;
    
    private SignInController signInController;
    private RegisterController registerController;
    private AppController appController;
    
    private ClientSocket clientSocket = null;
    
    @Override
    public void start(Stage stage) throws Exception 
    {
        primaryStage = stage;      
        if (!initialize())
        {
            System.out.println("Error");
            return;
        }
        showSignInView();
    }
    
    boolean initialize()
    {
        boolean bRes = true;
        
        signInLoader = new FXMLLoader();
        registerLoader = new FXMLLoader();
        mainLoader = new FXMLLoader();

        signInLoader.setLocation(Main.class.getResource("SignInView.fxml"));
        registerLoader.setLocation(Main.class.getResource("RegisterView.fxml"));
        mainLoader.setLocation(Main.class.getResource("MainView.fxml"));
        
        try
        {
            Parent rootSignIn = signInLoader.load();
            Parent rootRegister = registerLoader.load();
            Parent rootMain = mainLoader.load();
            
            signInScene = new Scene(rootSignIn);
            registerScene = new Scene(rootRegister);
            mainScene = new Scene(rootMain);

            signInController = signInLoader.getController();
            registerController = registerLoader.getController();
            appController = mainLoader.getController();

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
        catch(Exception ex)
        {
            System.out.println("Initialize error " + ex.getMessage());
            bRes = false;
        }        
        return bRes;
    }
    
    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) 
    {
        launch(args);
    }
    
    // ------ MAIN CONTROLLER IMPLEMENTATION ------ //
    
    @Override 
    public void showSignInView()
    {
        this.primaryStage.setScene(signInScene);
        this.signInController.initView();
        this.primaryStage.show();
    }
    
    @Override
    public void showRegisterView()
    {
        this.primaryStage.setScene(registerScene);
        this.registerController.initView();
        this.primaryStage.show();
    }
    
    @Override
    public void showAppView()
    {
        this.primaryStage.setScene(mainScene);
        this.appController.initView();
        this.primaryStage.show();
    }
    
    @Override
    public void sendMessage(String message)
    {
        if (clientSocket != null)
        {
            clientSocket.sendMessage(message);
        }
    }
    
    @Override
    public void signInFailed()
    {
        Platform.runLater(()->
        {
            signInController.showSignInFailedError();
        });
    }
    
    @Override
    public void signInSucceded()
    {
        Platform.runLater(()->
        {
            // 
        });
    }
    
    @Override
    public void registerFailed()
    {
        Platform.runLater(()->
        {
            registerController.showRegistrationFailedError();
        });
    }
    
    @Override
    public void registerSucceded()
    {
        Platform.runLater(()->
        {
            showSignInView();
        });
    }
    
    
}
