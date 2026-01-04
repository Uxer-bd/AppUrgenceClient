import React, { useState, useEffect, useCallback } from 'react';
import {
  IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonCard, IonCardContent, IonIcon, IonLabel, IonButton, useIonToast, IonLoading,
  IonRefresher, IonRefresherContent, IonBadge
} from '@ionic/react';
import {
  checkmarkCircle, timeOutline, buildOutline, call, chatbubbleEllipsesOutline, star, starOutline
} from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom'; // Ajout de useLocation

import { IonModal } from '@ionic/react';

// Interface des données API
interface InterventionData {
  id: number;
  reference: string;
  description: string;
  title : string;
  address: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'closed';
  sub_status?: 'en-route' | 'arrive' | null;
  created_at: string;
  problem_type?: { name: string }; // Si inclus par l'API
  assigned_agent?: { name: string; phone: string; } | null;
}

interface SuiviParams {
  id: string;
  phone : string;
}

interface QuoteItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Quote {
  id: number;
  amount: number;
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  items: QuoteItem[];
}

// Dans le composant SuivieUrgence

const SuivieUrgence: React.FC = () => {
  const history = useHistory();

  const [present] = useIonToast();

  const { id, phone } = useParams<SuiviParams>()

  const interventionId = id;
  const tel = phone;

  // const clientPhone = localStorage.getItem('reporter_phone');

  const clientPhone = phone;

  const [intervention, setIntervention] = useState<InterventionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Pour stocker les devis associés
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasRated, setHasRated] = useState(false);

  const [isDismissed, setIsDismissed] = useState(false);
  // --- Configuration API ---
  // Endpoint public ou client pour suivre une intervention
  const API_URL = "https://api.depannel.com/api/interventions";


  // --- Fonction de chargement des devis associés ---
  const fetchQuotes = useCallback(async () => {
    if (!interventionId || !clientPhone) return;
    try {
      const response = await fetch(
        `https://api.depannel.com/api/interventions/${interventionId}/quotes?phone=${clientPhone}`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (response.ok) {
        const json = await response.json();
        setQuotes(json.data || json || []);
      }
    } catch (error) {
      console.error("Erreur chargement devis:", error);
    }
  }, [interventionId, clientPhone]);

  const handleQuoteDecision = async (quoteId: number, action: 'accept' | 'reject') => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.depannel.com/api/quotes/${quoteId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            {
              phone : clientPhone,
              ...(action === 'reject' && { reason: "Prix trop élevé ou autre raison" })
            }
        )}
      );

        if (!response.ok) throw new Error("Échec de l'opération");

        present({ message: `Devis ${action === 'accept' ? 'accepté' : 'refusé'} avec succès`, color: 'success', duration: 2000 });
        fetchQuotes(); // Recharger pour mettre à jour le statut
      } catch (error) {
        present({ message: "Erreur lors de la validation du devis", color: 'danger', duration: 3000 });
      } finally {
        setIsLoading(false);
      }
  };

// Appelez cette fonction dans votre useEffect de chargement initial

  // --- Fonction de chargement des données ---
  const fetchInterventionStatus = useCallback(async (isSilent = true) => {
    if (!interventionId || !clientPhone) return;

    if (!isSilent) setIsLoading(true); // On ne montre le loader que si demandé explicitement

    try {
      const fullUrl = `${API_URL}/${interventionId}?phone=${clientPhone}`;
      const response = await fetch(fullUrl, { headers: { 'Accept': 'application/json' } });
      if (response.ok) {
        const json = await response.json();
        const data = json.intervention || json.data || json;
        setIntervention(data);
      }
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [interventionId, clientPhone]); // Ajout de clientPhone et present aux dépendances

    // --- Fonction de soumission de l'avis ---
    const submitRating = async () => {
    if (rating === 0) {
      present({ message: "Veuillez choisir une note (étoiles)", color: 'warning', duration: 2000 });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.depannel.com/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          intervention_id: Number(interventionId), // ID de l'intervention (integer)
          rating: rating,                          // Note (integer)
          comment: comment,                        // Commentaire (string)
          client_phone: clientPhone                // Téléphone du client (string)
        })
      });

      if (!response.ok) throw new Error("Erreur lors de l'envoi de l'avis");

      present({ message: "Merci ! Votre avis a été enregistré.", color: 'success', duration: 3000 });
      setHasRated(true);
      setShowRatingModal(false);
    } catch (error) {
      present({ message: "Impossible d'envoyer la note pour le moment.", color: 'danger', duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };


  // Chargement initial et Polling (Rafraîchissement automatique toutes les 10s)
  useEffect(() => {
  if (!interventionId || !clientPhone) return;

  // 1. Chargement initial avec loader
  setIsLoading(true);
  Promise.all([fetchInterventionStatus(), fetchQuotes()]).finally(() => {
    setIsLoading(false);
  });

  // 2. Mise en place du rafraîchissement automatique (Polling)
  const intervalId = setInterval(() => {
    // On ne rafraîchit que si l'intervention n'est pas finalisée
    if (intervention?.status !== 'closed' && intervention?.status !== 'completed') {
      fetchInterventionStatus();
      fetchQuotes();
    }
  }, 10000); // 10 secondes

  return () => clearInterval(intervalId); // Nettoyage
}, [interventionId, clientPhone, fetchInterventionStatus, fetchQuotes, intervention?.status]);

  useEffect(() => {
      // Si l'intervention est terminée et que le client n'a pas encore noté
      if (intervention?.status === 'completed' && !hasRated && !isDismissed) {
      setShowRatingModal(true);
    }
  }, [intervention?.status, hasRated, isDismissed]);

  // --- Logique d'affichage du statut (Timeline) ---
  const getSteps = () => {
    if (!intervention) return [];
    
    const status = intervention.status;
    // const subStatus = intervention.sub_status;

    return [
      {
        name: 'Réceptionnée',
        icon: checkmarkCircle,
        active: true, // Toujours vrai si l'intervention existe
        isCompleted: true
      },
      {
        name: 'Agent Affecté',
        icon: checkmarkCircle,
        active: ['accepted', 'in_progress', 'completed', 'closed'].includes(status),
        isCompleted: ['in_progress', 'completed', 'closed'].includes(status)
      },
      {
        name: 'En Route', 
        icon: checkmarkCircle, 
        active: ['accepted', 'in_progress', 'completed', 'closed'].includes(status),
        isCompleted: ['in_progress', 'completed', 'closed'].includes(status)
      },
      { 
        name: 'En intervention',
        icon: timeOutline, 
        active: ['in_progress', 'completed', 'closed'].includes(status),
        isCompleted: ['in_progress', 'completed', 'closed'].includes(status)
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

  if (!intervention && !isLoading) {
    // Afficher un message si l'intervention n'a pas pu être chargée après tentative
    return (
        <IonPage>
            <IonHeader><IonToolbar><IonTitle>Suivi de {tel}</IonTitle></IonToolbar></IonHeader>
            <IonContent className="ion-padding">
                <IonCard color="danger">
                    <IonCardContent>
                        <p>Impossible de charger les détails de l'intervention. Veuillez vérifier l'ID et le numéro de téléphone.</p>
                        <IonButton expand="full" onClick={() => history.replace('/')}>Retour à l'accueil</IonButton>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
  }
  
  // Si l'intervention n'est pas chargée (ex: clientPhone manquant et !isLoading), on retourne null après l'erreur gérée dans useEffect
  if (!intervention) return null; 

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Suivi intervention #{intervention.id}</IonTitle>
          {/* <IonButton onClick={() => {
            fetchInterventionStatus(false);
            fetchQuotes();
          }}>
            <IonIcon icon={refreshOutline} className={isLoading ? 'animate-spin' : ''} />
          </IonButton> */}
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding" style={{ '--background': '#f4f5f8', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
        </IonRefresher>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          {/* Card: Votre demande */}
          <IonCard style={{ borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width : '85%' }}>
            <IonCardContent>
              <h2 style={{ fontWeight: 'bold', marginBottom: '15px' }}>Votre demande</h2>
              {/* Afficher les données réelles */}
              {/* <p><strong>Type :</strong> {intervention.problem_type?.name || 'Urgence'}</p> */}
              <p><strong>Type de panne :</strong> {intervention.title}</p>
              <p><strong>Adresse :</strong> {intervention.address}</p>
              {/* <p><strong>Type :</strong> {intervention.problem_type?.name || 'Urgence'}</p> */}
              <IonBadge color={intervention.status === 'pending' ? 'warning' : 'success'} style={{marginTop: '10px'}}>
                {intervention.status === 'pending' ? 'En attente d\'attribution' : 'Prise en charge'}
              </IonBadge>
            </IonCardContent>
          </IonCard>

          {/* Section Devis */}
          {quotes.filter(q => q.status === 'pending' || q.status === 'accepted').map(quote => (
            <IonCard key={quote.id} style={{ borderRadius: '15px', border: '2px solid #3880ff', width: '85%' }}>
              <IonCardContent>
                <h2 style={{ fontWeight: 'bold', color: '#3880ff' }}>Devis</h2>
                <p><strong>Description :</strong> {quote.description}</p>
                <div style={{ background: '#f4f5f8', padding: '10px', borderRadius: '10px', margin: '10px 0' }}>
                  {quote.items.map((item, idx) => (
                    <p key={idx} style={{ margin: '2px 0', fontSize: '0.9em' }}>
                      {item.name} (x{item.quantity}) : {item.total} FCFA
                    </p>
                  ))}
                  <h3 style={{ borderTop: '1px solid #ddd', paddingTop: '5px', marginTop: '5px', textAlign: 'right' }}>
                    Total : {quote.amount} FCFA
                  </h3>
                </div>
                {quote.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <IonButton expand="block" color="success" style={{ flex: 1 }} onClick={() => handleQuoteDecision(quote.id, 'accept')}>
                      Accepter
                    </IonButton>
                    <IonButton expand="block" color="danger" fill="outline" style={{ flex: 1 }} onClick={() => handleQuoteDecision(quote.id, 'reject')}>
                      Refuser
                    </IonButton>
                  </div>
                )}
              </IonCardContent>
              <IonBadge color={quote.status === 'pending' ? 'warning' : quote.status === 'accepted' ? 'success' : 'danger'} style={{ margin: '10px' }}>
                {quote.status === 'pending' ? 'En attente de votre décision' : quote.status === 'accepted' ? 'Devis accepté' : 'Devis refusé'}
              </IonBadge>
            </IonCard>
          ))}


          {/* Card: Statut de l'intervention (Timeline Dynamique) */}
          <IonCard style={{ borderRadius: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width : '85%' }}>
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
            <IonCard style={{ borderRadius: '15px', '--background': '#eef5ff', boxShadow: 'none', width : '85%' }}>
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
          <div style={{ marginTop: '20px', width:'85%', border: '1px solid #ff4961', borderRadius: '15px', padding: '15px', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#ff4961' }}>
              Besoin d'aide immédiate ?
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <IonButton
                color="danger"
                style={{ flex: 1, marginRight: '5px' }}
                href="tel:74213460" // Numéro du standard général
              >
                <IonIcon slot="start" icon={call} />
                Appeler
              </IonButton>
              <IonButton
                fill="outline"
                color="danger"
                style={{ flex: 1, marginLeft: '5px' }}
                href="https://wa.me/22674213460" // Lien WhatsApp
              >
                <IonIcon slot="start" icon={chatbubbleEllipsesOutline} />
                message
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
      <IonModal 
        isOpen={showRatingModal} 
        onDidDismiss={() => setShowRatingModal(false)}
        initialBreakpoint={0.5} 
        breakpoints={[0, 0.5, 0.8]}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Votre avis compte</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <h3 style={{ fontWeight: 'bold' }}>Comment s'est passée votre dépannage ?</h3>
            {/* Système d'étoiles */}
            <div style={{ fontSize: '3em', margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((num) => (
                <IonIcon
                  key={num}
                  icon={num <= rating ? star : starOutline}
                  style={{ color: num <= rating ? '#ffc409' : '#ccc', cursor: 'pointer', margin: '0 5px' }}
                  onClick={() => setRating(num)}
                />
              ))}
            </div>

            <textarea
              placeholder="Laissez un petit commentaire (optionnel)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: '100%',
                height: '100px',
                borderRadius: '12px',
                padding: '12px',
                border: '1px solid #ddd',
                fontSize: '1em'
              }}
            />

            <IonButton
              expand="block"
              style={{ marginTop: '25px', '--border-radius': '10px' }}
              onClick={submitRating}
            >
              Envoyer mon avis
            </IonButton>
            
            <IonButton
              fill="clear"
              expand="block"
              color="medium"
              onClick={() => {
                setIsDismissed(true);
                setShowRatingModal(false);
              }}
            >
              Plus tard
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default SuivieUrgence;