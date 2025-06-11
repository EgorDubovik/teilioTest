import { useState, useEffect, useRef } from "react";
import { Device } from "@twilio/voice-sdk";
import "./App.css";

function App() {
   const [device, setDevice] = useState(null);
   const [isReady, setIsReady] = useState(false);
   const [call, setCall] = useState(null);
   const [numberToCall, setNumberToCall] = useState("");
   const [status, setStatus] = useState("Initializing...");
   const deviceRef = useRef(null);

   useEffect(() => {
      const fetchToken = async () => {
         try {
            const res = await fetch(
               "https://twilio.edservicetx.com/token?identity=egor"
            ); // Замените на свой URL

            const data = await res.json();

            const newDevice = new Device(data.token, { debug: true });

            newDevice.on("error", (error) => {
               console.error("Twilio Device error:", error);
               setStatus("Error: " + error.message);
            });

            newDevice.on("incoming", (incomingCall) => {
               setStatus("Incoming call...");
               incomingCall.accept();
               setCall(incomingCall);
            });

            newDevice.on("registered", (connection) => {
               setStatus("Device registered");
               setIsReady(true);
               setCall(connection);
            });

            newDevice.on("disconnect", () => {
               setStatus("Call ended");
               setCall(null);
            });

            newDevice.register();
            setDevice(newDevice);
            deviceRef.current = newDevice;
         } catch (err) {
            console.error("Failed to fetch token", err);
            setStatus("Failed to initialize");
         }
      };

      fetchToken();

      return () => {
         if (deviceRef.current) {
            deviceRef.current.destroy();
         }
      };
   }, []);
   const handleCall = () => {
      if (device) {
         console.log(numberToCall);
         const params = {
            To: "+17542264666",
            CustomParameters: "egor",
         };
         const connection = device.connect({ params });
         console.log(connection);
         setCall(connection);
      }
   };

   const handleHangUp = () => {
      if (call) {
         call.disconnect();
         setCall(null);
      }
   };
   return (
      <>
         <div style={{ padding: 20 }}>
            <h2>Twilio Voice Client</h2>
            <p>Status: {status}</p>

            <input
               type="text"
               placeholder="Enter number"
               value={numberToCall}
               onChange={(e) => setNumberToCall(e.target.value)}
               disabled={!isReady || !!call}
            />

            <div style={{ marginTop: 10 }}>
               <button onClick={handleCall} disabled={!isReady || !!call}>
                  Call
               </button>
               <button onClick={handleHangUp} disabled={!call}>
                  Hang Up
               </button>
            </div>
         </div>
      </>
   );
}

export default App;
