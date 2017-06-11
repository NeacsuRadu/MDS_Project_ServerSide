/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
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
    
    private HashMap<String, ChatWindow> windowsMap;
    
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
    
    public synchronized Stage getStage()
    {
        return this.primaryStage;
    }
    
    public synchronized void showMessage(String username_from, String message)
    {
        openWindowOrSetFocus(username_from);
        windowsMap.get(username_from).getController().showMessage(message);
    }
    
    boolean initialize()
    {
        boolean bRes = true;
        
        windowsMap = new HashMap();
        MessageHandler.getInstance().addHandler(this);
        
        signInLoader = new FXMLLoader();
        registerLoader = new FXMLLoader();
        mainLoader = new FXMLLoader();

        signInLoader.setLocation(Main.class.getResource("SignInView.fxml"));
        registerLoader.setLocation(Main.class.getResource("RegisterView.fxml"));
        mainLoader.setLocation(Main.class.getResource("MainView.fxml"));
        
        JSONObject ob = new JSONObject();
        try
        {
            signInLoader = new FXMLLoader();
            registerLoader = new FXMLLoader();
            mainLoader = new FXMLLoader();

            signInLoader.setLocation(Main.class.getResource("SignInView.fxml"));
            registerLoader.setLocation(Main.class.getResource("RegisterView.fxml"));
            mainLoader.setLocation(Main.class.getResource("MainView.fxml"));
        
            Parent rootSignIn = signInLoader.load();
            Parent rootRegister = registerLoader.load();
            Parent rootMain = mainLoader.load();
            
            signInScene = new Scene(rootSignIn);
            registerScene = new Scene(rootRegister);
            mainScene = new Scene(rootMain);

            signInController = signInLoader.getController();
            registerController = registerLoader.getController();
            appController = mainLoader.getController();

            signInController.setMainController(this);
            registerController.setMainController(this);
            appController.setMainController(this);
            
        }
        catch(IOException ex)
        {
            System.out.println("Initialize error " + ex.getMessage());
            bRes = false;
        }     
        
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
    public String getUsername()
    {
        return appController.getUsername();
    }
    
    @Override
    public void removeWindow(String username)
    {
        if (windowsMap.containsKey(username))
        {
            windowsMap.remove(username);
        }
    }
    
    @Override 
    public void openWindowOrSetFocus(String username)
    {
        if (windowsMap.containsKey(username) == false)
        {
            ChatWindow window = new ChatWindow(username, this);
            if (window.createWindow() == true)
            {
                windowsMap.put(username, window);
            }
        }
        else 
        {
            ChatWindow window = windowsMap.get(username);
            window.requestFocus();
        }
    }
    
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
    public void signInSucceded(UserData userData, ArrayList<Friend> userFriends, ArrayList<String> friendRequests)
    {
        Platform.runLater(()->
        {
            appController.signInSucceeded(userData, userFriends, friendRequests);
            showAppView();
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
    
    @Override
    public void updateFriends(String username, boolean online)
    {
        Platform.runLater(()->
        {
            appController.updateFriends(username, online);
        });
    }
    
    @Override
    public void addFriendRequest(String username)
    {
        Platform.runLater(()->
        {
            appController.addFriendRequest(username);
        });
    }
    
    @Override 
    public void friendRequestFailed()
    {
        Platform.runLater(()->
        {
            appController.friendRequestFailed();
        });
    }
    
    @Override
    public void messageReceived(String username_from, String message)
    {
        Platform.runLater(()->
        {
            showMessage(username_from, message);
        }); 
    }
}
