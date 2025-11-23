import { defineStore } from "pinia";
import cities from "@/assets/world_cities.json";

export const useCityStore = defineStore("cityStore", {
 state: () => ({
  cities: cities.filter(c =>
    c.capital === "primary" ||
    c.capital === "admin" 
  ),
}),


  getters: {
    /**
     * Cities for a given ISO-2 country code
     */
    getCitiesByIso: (state) => {
      return (iso2) => {
        if (!iso2) return [];

        return state.cities
          .filter(city => city.iso2 === iso2)
          .map(city => city.city)
          .sort((a, b) => a.localeCompare(b));
      };
    },

    /**
     * Return { name, code } for countries found in filtered dataset
     */
    getCountries: (state) => {
      const map = new Map();

      state.cities.forEach((city) => {
        map.set(city.iso2, city.country);
      });

      return [...map.entries()]
        .map(([code, name]) => ({ code, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
  }
});
