import React, { useState, useEffect, useCallback } from 'react';
import { 
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, 
    IonLabel, IonSpinner, IonText, useIonToast, IonIcon, IonButtons, 
    IonButton, IonNote, IonRefresher, IonRefresherContent, IonSegment, 
    IonSegmentButton, IonBadge
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { 
    arrowBackOutline, refreshOutline, timeOutline, alertCircleOutline, 
    locateOutline, checkmarkDoneOutline, warningOutline 
} from 'ionicons/icons';

// --- Interface de l'Intervention (Basée sur les données probables de l'API) ---
interface Intervention {
    id: number;
    reference: string;
    description: string;
    address: string;
    status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'closed' | string;
    created_at: string;
    // Informations optionnelles, si fournies par l'API
    client_name?: string; 
    assigned_agent?: { name: string } | null;
}

const InterventionListPage: React.FC = () => {
    const history = useHistory();
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all'); // Filtre actif
    const [present] = useIonToast();

    // --- Configuration API ---
    // Endpoint pour lister les interventions (GET /interventions)
    const API_URL = "https://intervention.tekfaso.com/api/interventions"; 
    const TOKEN = localStorage.getItem('access_token'); 

    // --- Utilitaires de Statut ---
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return { color: 'danger', icon: alertCircleOutline, label: 'En Attente' };
            case 'accepted':
            case 'in-progress':
                return { color: 'warning', icon: timeOutline, label: 'En Cours' };
            case 'completed':
            case 'closed':
                return { color: 'success', icon: checkmarkDoneOutline, label: 'Terminée' };
            default:
                return { color: 'medium', icon: warningOutline, label: 'Inconnu' };
        }
    };

    // --- Fonction de chargement des interventions ---
    const fetchInterventions = useCallback(async (refresh = false) => {
        if (!TOKEN) {
            setError("Erreur d'authentification. Session expirée.");
            history.replace('/login');
            return;
        }

        if (!refresh) setLoading(true); else setIsRefreshing(true);
        setError(null);

        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Accept': 'application/json'
                },
            });

            if (response.status === 401) throw new Error('Session expirée.');
            if (!response.ok) {
                throw new Error(`Échec du chargement: ${response.status}`);
            }

            const result = await response.json();
            
            // On suppose que les données sont directement sous 'data' ou 'interventions'
            const list = result.data?.interventions || result.data || result;
            if (Array.isArray(list)) {
                setInterventions(list as Intervention[]);
            } else {
                setInterventions([]);
                present({ message: "Structure de données invalide.", duration: 3000, color: 'warning' });
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erreur inconnue lors de la récupération des interventions.";
            setError(errorMessage);
            present({ message: errorMessage, duration: 4000, color: 'danger' });
        } finally {
            if (!refresh) setLoading(false); else setIsRefreshing(false);
        }
    }, [TOKEN, present, history]);

    useEffect(() => {
        fetchInterventions();
    }, [fetchInterventions]);
    
    const handleRefresh = (event: CustomEvent) => {
        fetchInterventions(true).then(() => event.detail.complete());
    };

    // --- Filtrage des interventions ---
    const filteredInterventions = interventions.filter(inter => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'active') {
            return inter.status === 'accepted' || inter.status === 'in-progress';
        }
        return inter.status === filterStatus;
    });

    /* --- Rendu --- */

    if (loading) {
        return (
            <IonPage>
                <IonHeader><IonToolbar color="primary"><IonTitle>Interventions</IonTitle></IonToolbar></IonHeader>
                <IonContent className="ion-padding ion-text-center">
                    <IonSpinner name="crescent" className="ion-margin-top" />
                    <IonText color="medium"><p>Chargement des interventions...</p></IonText>
                </IonContent>
            </IonPage>
        );
    }
    
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButtons slot="start">
                        <IonButton onClick={() => history.goBack()}>
                            <IonIcon slot="icon-only" icon={arrowBackOutline} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Interventions ({filteredInterventions.length})</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => fetchInterventions(true)} disabled={isRefreshing}>
                            <IonIcon icon={refreshOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>

                {/* Barre de Filtrage */}
                <IonSegment 
                    value={filterStatus} 
                    onIonChange={e => setFilterStatus(e.detail.value!)} 
                    color="primary"
                    scrollable={true}
                    className="ion-padding-horizontal ion-margin-bottom"
                >
                    <IonSegmentButton value="all"><IonLabel>Tout ({interventions.length})</IonLabel></IonSegmentButton>
                    <IonSegmentButton value="pending"><IonLabel>Attente</IonLabel></IonSegmentButton>
                    <IonSegmentButton value="active"><IonLabel>En Cours</IonLabel></IonSegmentButton>
                    <IonSegmentButton value="completed"><IonLabel>Terminée</IonLabel></IonSegmentButton>
                </IonSegment>

                {error && (
                    <div className="ion-padding ion-text-center">
                        <IonText color="danger"><p>Erreur: {error}</p></IonText>
                        <IonButton onClick={() => fetchInterventions(true)}>Réessayer</IonButton>
                    </div>
                )}

                {!error && interventions.length === 0 ? (
                    <div className="ion-padding ion-text-center">
                        <IonText color="medium"><p>Aucune intervention dans le système.</p></IonText>
                        {/* Optionnel: Bouton pour créer une intervention si l'admin peut le faire */}
                    </div>
                ) : (
                    <IonList>
                        {filteredInterventions.map((inter) => {
                            const status = getStatusStyle(inter.status);
                            
                            return (
                                <IonItem 
                                    key={inter.id} 
                                    detail={true} 
                                    // Lien vers la page de détail pour Manager
                                    routerLink={`/suivie-urgence/${inter.id}`} 
                                    lines="full"
                                >
                                    <IonIcon icon={locateOutline} slot="start" color="medium" />
                                    <IonLabel>
                                        <h2>{inter.reference || `#${inter.id}`} - {inter.address}</h2>
                                        <p>{inter.description.substring(0, 50)}...</p>
                                        <IonNote color="medium">
                                            Demandeur: {inter.client_name || 'Invité'}
                                            {inter.assigned_agent && ` | Assigné à: ${inter.assigned_agent.name}`}
                                        </IonNote>
                                    </IonLabel>
                                    <IonBadge slot="end" color={status.color} style={{ minWidth: '80px', textAlign: 'center' }}>
                                        {status.label}
                                    </IonBadge>
                                </IonItem>
                            );
                        })}
                    </IonList>
                )}
            </IonContent>
        </IonPage>
    );
};

export default InterventionListPage;