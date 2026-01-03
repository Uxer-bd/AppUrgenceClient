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
    client_name?: string; 
    client_phone?: string; // Assurez-vous que l'API renvoie le numéro client
    assigned_agent?: { name: string } | null;
}

const InterventionListPage: React.FC = () => {
    const history = useHistory();
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'pending' | 'active' | 'completed'>('pending');
    const [present] = useIonToast();

    // Récupération des données locales (pour le mode client non authentifié)
    const localReporterName = localStorage.getItem('reporter_name');
    const localReporterPhone = localStorage.getItem('reporter_phone');
    
    // --- Configuration API ---
    const API_URL_BASE = "https://api.depannel.com/api/interventions"; 
    const TOKEN = localStorage.getItem('access_token');

    // Compte des catégories pour le filtrage 
    const countPending = interventions.filter(i => i.status === 'pending').length;

    const countActive = interventions.filter(i =>
        i.status === 'accepted' || i.status === 'in-progress'
    ).length;

    const countCompleted = interventions.filter(i =>
        i.status === 'completed' || i.status === 'closed'
    ).length;

    // --- Utilitaires de Statut (inchangé) ---
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

    // --- Fonction de chargement des interventions (MODIFIÉE) ---
    const fetchInterventions = useCallback(async (refresh = false) => {
        
        let targetUrl = API_URL_BASE;
        const headers: HeadersInit = {
            'Accept': 'application/json'
        };
        let isPublicMode = false;

        // Déterminer le mode d'accès (Token ou Public par téléphone)
        if (TOKEN) {
            // MODE AUTHENTIFIÉ (Manager/Agent) : Utilise le Token
            headers['Authorization'] = `Bearer ${TOKEN}`;
        } else if (localReporterPhone) {
            // MODE PUBLIC (Client) : Utilise le numéro de téléphone local
            targetUrl = `${API_URL_BASE}?phone=${localReporterPhone}`;
            isPublicMode = true;
        } else {
            // Aucun moyen de s'authentifier ou de filtrer
            setError("Impossible de charger les interventions. Données d'accès manquantes.");
            // On pourrait rediriger vers la page d'accueil ou de connexion si aucune donnée n'est trouvée
            // history.replace('/login'); 
            return;
        }

        if (!refresh) setLoading(true); else setIsRefreshing(true);
        setError(null);

        try {
            const response = await fetch(targetUrl, {
                method: 'GET',
                headers: headers,
            });

            if (response.status === 401 && !isPublicMode) throw new Error('Session expirée.');
            if (!response.ok) {
                // Gestion d'erreur spécifique au mode public/token
                const errorDetail = await response.json();
                throw new Error(`Échec du chargement: ${response.status}. ${errorDetail.message || ''}`);
            }

            const result = await response.json();
            
            // On suppose que les données sont directement sous 'data' ou 'interventions'
            // L'image API montrait un tableau 'data' directement.
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
    }, [TOKEN, localReporterPhone, present]); // Dépendances mises à jour

    useEffect(() => {
        fetchInterventions();
    }, [fetchInterventions]);
    
    const handleRefresh = (event: CustomEvent) => {
        fetchInterventions(true).then(() => event.detail.complete());
    };

    // --- Filtrage des interventions (inchangé) ---
    const filteredInterventions = interventions.filter(inter => {
        if (filterStatus === 'pending') return inter.status === 'pending';

        if (filterStatus === 'active') {
            return inter.status === 'accepted' || inter.status === 'in-progress';
        }

        if (filterStatus === 'completed') {
            return inter.status === 'completed' || inter.status === 'closed';
        }

        return false;
    });

    /* --- Rendu --- */
    // Le rendu reste le même que la version précédente, car la logique de chargement
    // et d'affichage est gérée par les hooks et la fonction fetchInterventions.

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
                    onIonChange={e => setFilterStatus(e.detail.value as 'pending' | 'active' | 'completed')}
                    color="primary"
                    scrollable={true}
                    className="ion-padding-horizontal ion-margin-bottom"
                >
                    <IonSegmentButton value="pending">
                        <IonLabel>En attente</IonLabel>
                        {countPending > 0 && <IonBadge color="danger">{countPending}</IonBadge>}
                    </IonSegmentButton>

                    <IonSegmentButton value="active">
                        <IonLabel>En cours</IonLabel>
                        {countActive > 0 && <IonBadge color="warning">{countActive}</IonBadge>}
                    </IonSegmentButton>

                    <IonSegmentButton value="completed">
                        <IonLabel>Terminée</IonLabel>
                        {countCompleted > 0 && <IonBadge color="success">{countCompleted}</IonBadge>}
                    </IonSegmentButton>
                </IonSegment>

                {error && (
                    <div className="ion-padding ion-text-center">
                        <IonText color="danger"><p>Erreur: {error}</p></IonText>
                        <IonButton onClick={() => fetchInterventions(true)}>Réessayer</IonButton>
                    </div>
                )}

                {!error && filteredInterventions.length === 0 ? (
                    <div className="ion-padding ion-text-center">
                        <IonText color="medium">
                            <p>
                                {/* Message adapté au mode public/privé */}
                                {localReporterPhone && !TOKEN 
                                    ? `Aucune intervention trouvée pour le numéro ${localReporterPhone}.`
                                    : "Aucune intervention dans le système."
                                }
                            </p>
                        </IonText>
                    </div>
                ) : (
                    <IonList>
                        {filteredInterventions.map((inter) => {
                            const status = getStatusStyle(inter.status);
                            
                            // Déterminer le nom du demandeur (logique précédente conservée et améliorée)
                            let requesterDisplay = 'Inconnu';
                            
                            // 1. Priorité aux données API (si elles existent)
                            if (inter.client_name) {
                                requesterDisplay = inter.client_name;
                            }
                            // 2. Sinon, utiliser le nom stocké localement si le numéro correspond
                            else if (localReporterPhone && (inter.client_phone === localReporterPhone || !inter.client_phone)) {
                                // Si l'intervention n'a pas de client_phone dans la réponse, on suppose que c'est celle de l'utilisateur actuel si on est en mode public.
                                requesterDisplay = localReporterName || 'Moi (Local)';
                            } 
                            // 3. Fallback (Si l'API fournit le numéro, mais pas le nom)
                            else if (inter.client_phone) {
                                requesterDisplay = inter.client_phone;
                            }
                            const phoneToSend =
                            inter.client_phone && inter.client_phone.trim() !== ""
                                ? inter.client_phone
                                : localReporterPhone;
                            
                            return (
                                <IonItem 
                                    key={inter.id} 
                                    detail={true} 
                                    // Lien vers la page de détail pour Manager ou Client
                                    // Le numéro de téléphone est ajouté au lien pour le suivi public.
                                    routerLink={`/suivie-urgence/${inter.id}/${phoneToSend}`} 
                                    lines="full"
                                >
                                    <IonIcon icon={locateOutline} slot="start" color="medium" />
                                    <IonLabel>
                                        <h2>{inter.reference || `#${inter.id}`} - {inter.address}</h2>
                                        <p>{inter.description.substring(0, 50)}...</p>
                                        <IonNote color="medium">
                                            Demandeur: {requesterDisplay}
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