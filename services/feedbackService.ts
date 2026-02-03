import {UserVote, VoteStats} from '../types';
const API_URL = 'http://localhost:3000/api/feedback';

const mapFeedback = (dbItem: any): UserVote => {
  return {
    id: dbItem._id,
    isPositive: dbItem.feedback
  };
};

export const getFeedback = async (negozio_id: string): Promise<UserVote | null> => {
  try {
    let url = API_URL + '?negozio_id=' + negozio_id;
    const token = localStorage.getItem('token');
    if (!token) { //se l'utente non è loggato, non avrà alcun feedback associato
      return null;
    }

    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };

    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (response.status===404) { //se l'utente non ha ancora votato
      return null;
    }

    if (!response.ok) {
       const erroreServer = await response.json();
       throw new Error(erroreServer.dettagli)
    }
    const votoBackend = await response.json();

    if (votoBackend.feedback && votoBackend.feedback.length > 0) {
        return mapFeedback(votoBackend.feedback[0]);
    }
    return null;
  }
  catch (error){
    console.error("Errore nella visualizzazione del feedback", error);
    return null;
  }
};

export const sendFeedback = async (negozio_id: string, voto: boolean): Promise<VoteStats> => {
  try {
    let url = API_URL;
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Utente non autenticato");
    }

    const headers: any = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        negozio: negozio_id,
        feedback: voto
    })
    });

    if (!response.ok) {
       const erroreServer = await response.json();
       if (response.status === 409) {
          throw new Error("Hai già votato per questo negozio!");
       }
       throw new Error(erroreServer.dettagli)
    }
    const rispostaBackend = await response.json();
    return {
        success: rispostaBackend.success,
        positiveCount: rispostaBackend.positive,
        negativeCount: rispostaBackend.negative  
    };
  }
  catch (error){
    console.error("Errore nell'invio del feedback", error);
    throw error;
  }
};

