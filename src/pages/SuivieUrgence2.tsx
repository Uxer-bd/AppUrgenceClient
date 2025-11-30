import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonCard, IonCardContent, IonIcon, IonLabel, IonButton, useIonToast, IonLoading,
  IonRefresher, IonRefresherContent, IonBadge
} from '@ionic/react';
import {
  checkmarkCircle, ellipse, timeOutline, buildOutline, call, chatbubbleEllipsesOutline, refreshOutline
} from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';

// Interface des données API
interface InterventionData {
  id: number;
  reference: string;
  description: string;
  address: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'closed';
  sub_status?: 'en-route' | 'arrive' | null;
  created_at: string;
  problem_type?: { name: string }; // Si inclus par l'API
  assigned_agent?: { name: string; phone: string; } | null;
}

// interface LocationState {
//   urgenceData?: any; // Pour récupérer l'ID initialement
// }

interface SuiviParams {
  id: string;
}

const SuivieUrgence: React.FC = () => {
//   const location = useLocation<LocationState>();
  const history = useHistory();
  const [present] = useIonToast();

  // On récupère l'ID initialement passé par la création, ou on gère le cas où l'utilisateur revient
  // Idéalement, cet ID devrait être stocké ou récupéré via une liste "Mes Urgences"
//   const initialData = location.state?.urgenceData;
//   const interventionId = initialData?.id;

  const { id } = useParams<SuiviParams>()

  const interventionId = id;

  const [intervention, setIntervention] = useState<InterventionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Configuration API ---
  // Endpoint public ou client pour suivre une intervention
  const API_URL = "https://intervention.tekfaso.com/api/interventions"; 
  // Note: Si l'utilisateur est un client connecté, utilisez son token. 
  // Sinon (mode invité), l'API doit permettre le GET par ID sans auth ou avec un token temporaire.
  const TOKEN = localStorage.getItem('access_token'); 

  // --- Fonction de chargement des données ---
  const fetchInterventionStatus = useCallback(async () => {
    if (!interventionId) return;

    try {
        const headers: HeadersInit = { 'Accept': 'application/json' };
        if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

        const response = await fetch(`${API_URL}/${interventionId}`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) throw new Error("Impossible de mettre à jour le statut.");

        const json = await response.json();
        const data = json.intervention || json.data || json;
        setIntervention(data);

    } catch (error) {
        console.error("Erreur de suivi:", error);
    } finally {
        setIsLoading(false);
    }
  }, [interventionId, TOKEN]);

  // Chargement initial et Polling (Rafraîchissement automatique toutes les 10s)
  useEffect(() => {
    if (!interventionId) {
        present({ message: "Aucune intervention à suivre.", duration: 3000, color: 'warning' });
        history.replace('/'); // Retour accueil si pas d'ID
        return;
    }

    fetchInterventionStatus();

    // Optionnel : Polling pour mise à jour temps réel sans action utilisateur
    const intervalId = setInterval(fetchInterventionStatus, 10000); // Toutes les 10 secondes

    return () => clearInterval(intervalId); // Nettoyage à la sortie
  }, [interventionId, fetchInterventionStatus, history, present]);


  // --- Logique d'affichage du statut (Timeline) ---
  const getSteps = () => {
    if (!intervention) return [];
    
    const status = intervention.status;
    const subStatus = intervention.sub_status;

    return [
      { 
        name: 'Réceptionnée', 
        icon: checkmarkCircle, 
        active: true, // Toujours vrai si l'intervention existe
        isCompleted: true 
      },
      { 
        name: 'Agent Affecté', 
        icon: ellipse, 
        active: ['accepted', 'in-progress', 'completed', 'closed'].includes(status),
        isCompleted: ['in-progress', 'completed', 'closed'].includes(status)
      },
      { 
        name: 'En Route', 
        icon: ellipse, 
        active: status === 'in-progress' || ['completed', 'closed'].includes(status),
        // Si sub_status est 'en-route' ou passé (arrive/completed)
        isCompleted: (status === 'in-progress' && subStatus === 'arrive') || ['completed', 'closed'].includes(status)
      },
      { 
        name: 'Arrivé', 
        icon: timeOutline, 
        active: (status === 'in-progress' && subStatus === 'arrive') || ['completed', 'closed'].includes(status),
        isCompleted: ['completed', 'closed'].includes(status)
      },
      { 
        name: 'Terminée', 
        icon: buildOutline, 
        active: ['completed', 'closed'].includes(status),
        isCompleted: ['completed', 'closed'].includes(status)
      },
    ];
  };

  const steps = getSteps();
  const currentStepIndex = steps.reduce((lastIndex, step, index) => step.active ? index : lastIndex, 0);

  const handleRefresh = (event: CustomEvent) => {
    fetchInterventionStatus().then(() => event.detail.complete());
  };

  if (!intervention && isLoading) {
      return (
        <IonPage>
            <IonHeader><IonToolbar><IonTitle>Chargement...</IonTitle></IonToolbar></IonHeader>
            <IonContent><IonLoading isOpen={true} /></IonContent>
        </IonPage>
      );
  }

  if (!intervention) return null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Suivi #{intervention.reference || intervention.id}</IonTitle>
          <IonButtons slot="end">
             <IonButton onClick={() => { setIsLoading(true); fetchInterventionStatus(); }}>
                <IonIcon icon={refreshOutline} />
             </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f4f5f8' }}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
        </IonRefresher>

        {/* Card: Votre demande */}
        <IonCard style={{ borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <IonCardContent>
            <h2 style={{ fontWeight: 'bold', marginBottom: '15px' }}>Votre demande</h2>
            {/* Afficher les données réelles */}
            {/* <p><strong>Type :</strong> {intervention.problem_type?.name || 'Urgence'}</p> */}
            <p><strong>Description :</strong> {intervention.description}</p>
            <p><strong>Adresse :</strong> {intervention.address}</p>
            <IonBadge color={intervention.status === 'pending' ? 'warning' : 'success'} style={{marginTop: '10px'}}>
                {intervention.status === 'pending' ? 'En attente d\'attribution' : 'Prise en charge'}
            </IonBadge>
          </IonCardContent>
        </IonCard>

        {/* Card: Statut de l'intervention (Timeline Dynamique) */}
        <IonCard style={{ borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
          <IonCardContent>
            <h2 style={{ fontWeight: 'bold', marginBottom: '20px' }}>Statut de l'intervention</h2>
            
            {steps.map((step, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '15px',
                  // Opacité réduite pour les étapes futures
                  opacity: step.active ? 1 : 0.3, 
                  transition: 'opacity 0.5s ease'
                }}
              >
                <div style={{ position: 'relative', marginRight: '15px' }}>
                    {/* Ligne verticale */}
                    {index < steps.length - 1 && (
                        <div style={{
                            position: 'absolute', left: '50%', top: '20px', bottom: '-20px', width: '2px',
                            backgroundColor: steps[index+1].active ? '#2dd36f' : '#ddd',
                            transform: 'translateX(-50%)', zIndex: 0
                        }} />
                    )}
                    <IonIcon
                    icon={step.icon}
                    style={{
                        color: step.active ? (step.isCompleted ? '#2dd36f' : '#3880ff') : '#ccc',
                        fontSize: '2em',
                        backgroundColor: '#fff',
                        zIndex: 1,
                        position: 'relative'
                    }}
                    />
                </div>
                <div>
                  <IonLabel style={{ fontWeight: 'bold', fontSize: '1.1em', color: step.active ? '#000' : '#888' }}>
                    {step.name}
                  </IonLabel>
                  {/* Afficher "En cours" uniquement sur l'étape active la plus avancée */}
                  {index === currentStepIndex && intervention.status !== 'completed' && intervention.status !== 'closed' && (
                      <p style={{ color: '#3880ff', margin: 0, fontSize: '0.9em', fontStyle: 'italic' }}>En cours...</p>
                  )}
                </div>
              </div>
            ))}
          </IonCardContent>
        </IonCard>

        {/* Card: Technicien assigné (Affiché uniquement si assigné) */}
        {intervention.assigned_agent && (
            <IonCard style={{ borderRadius: '15px', '--background': '#eef5ff', boxShadow: 'none' }}>
            <IonCardContent>
                <h3 style={{ fontWeight: 'bold' }}>Technicien assigné</h3>
                <p style={{ fontSize: '1.2em' }}>{intervention.assigned_agent.name}</p>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <IonButton 
                        fill="solid" 
                        color="success" 
                        size="small" 
                        href={`tel:${intervention.assigned_agent.phone}`}
                    >
                        <IonIcon icon={call} slot="start" /> Appeler
                    </IonButton>
                </div>
            </IonCardContent>
            </IonCard>
        )}

        {/* Section: Aide immédiate */}
        <div style={{ marginTop: '20px', border: '1px solid #ff4961', borderRadius: '15px', padding: '15px', textAlign: 'center' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#ff4961' }}>
            Besoin d'aide immédiate ?
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <IonButton
              color="danger"
              style={{ flex: 1, marginRight: '5px' }}
              href="tel:0800123456" // Numéro du standard général
            >
              <IonIcon slot="start" icon={call} />
              Standard
            </IonButton>
            <IonButton
              fill="outline"
              color="danger"
              style={{ flex: 1, marginLeft: '5px' }}
            >
              <IonIcon slot="start" icon={chatbubbleEllipsesOutline} />
              Support
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SuivieUrgence;