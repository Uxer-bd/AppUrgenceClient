// src/pages/LoginPage.tsx (Exemple simple)
import React, { useState } from 'react';
import { IonPage, IonContent, IonItem, IonLabel, IonInput, IonButton, IonLoading, useIonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('joker@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [present] = useIonToast();
  const history = useHistory();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://intervention.tekfaso.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.data.access_token) {

        localStorage.setItem('access_token', data.data.access_token);

        present({ message: 'Connexion réussie !', duration: 2000, color: 'success' });
        history.push('/signaler');
      } else {
        throw new Error(data.message || 'Email ou mot de passe incorrect.');
      }

    } catch (error: unknown) {

      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = String(error);
      }

      present({ message: message, duration: 3000, color: 'danger' });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonLoading isOpen={isLoading} message={'Connexion...'} />
        <IonItem>
          <IonLabel position="floating">Email</IonLabel>
          <IonInput type="email" value={email} onIonChange={e => setEmail(e.detail.value!)} />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Mot de passe</IonLabel>
          <IonInput type="password" value={password} onIonChange={e => setPassword(e.detail.value!)} />
        </IonItem>
        <IonButton expand="block" onClick={handleLogin} className="ion-margin-top">
          Se connecter
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;