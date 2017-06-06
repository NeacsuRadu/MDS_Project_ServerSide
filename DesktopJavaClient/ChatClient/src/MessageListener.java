
import java.util.NoSuchElementException;
import java.util.Scanner;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author Radu-Stefan Neacsu
 */
class MessageListener implements Runnable
{
    private Scanner scanner = null;
    private MessageHandler messageHandler = null;
    private Thread thread = null;
    
    public MessageListener(Scanner scanner)
    {
        this.scanner = scanner;
        this.messageHandler = MessageHandler.getInstance();
        this.thread = new Thread(this);
    }
    
    public void start()
    {
        thread.start();
    }
    
    @Override
    public void run()
    {
        String message;
        while (true)
        {
            try
            {
                message = scanner.nextLine();
            }
            catch(NoSuchElementException | IllegalStateException  ex)
            {
                System.out.println("Problem: " + ex.getMessage());
                message = null;
            }
            if (message == null)
            {
                break;
            }
            System.out.println(message);
            messageHandler.handleMessage(message);
        }
    }
}
