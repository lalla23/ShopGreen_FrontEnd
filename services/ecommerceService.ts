import { Seller } from '../types';

const API_URL = 'http://localhost:3000/api/eshops';

const mapSeller = (dbItem: any):  Seller => {
    return{
        id : dbItem._id,
        username: dbItem.User?.username || "aaa",
        zoneIds: dbItem.Zone || [],
        categories: dbItem.Categorie || [],
        platformLinks: dbItem.Links || [],
        avatarUrl: dbItem.User.profile_picture,
        bio: dbItem.Info || " "
    };
};

export const fetchSellers = async(Zone?: string, Categorie?: string): Promise<Seller[]> =>{

    try{
        const params = new URLSearchParams();
        if(Zone)params.append('Zone', Zone);
        if(Categorie && Categorie!== 'Tutte') params.append('Categorie', Categorie);

        const url = new URL(API_URL);
        url.search = params.toString();

        const response = await fetch(url.toString(), {
            method: 'GET',

        });

        const data = await response.json();

        if (!response.ok) {
        throw new Error(data.message);     
        }

         return data.map(mapSeller);

    }catch(error:any){
        console.error("Errore nel recupero dei venditori e-commerce", error);
        throw error;
    }

}