import {
  Grid2x2, CupSoda, UtensilsCrossed, Cookie, Snowflake,
  Flame, Coffee, Apple, Beef, CakeSlice,
  Candy, ChefHat, Croissant, Drumstick, Egg,
  Fish, GlassWater, IceCream, Milk, Pizza,
  Popcorn, Salad, Soup, Wine, Citrus,
  Sandwich, Martini, Shell
} from "lucide-react";
import { createElement } from "react";

export const ICON_OPTIONS = [
  "Grid2x2",
  "CupSoda",
  "UtensilsCrossed",
  "Cookie",
  "Snowflake",
  "Flame",
  "Coffee",
  "Apple",
  "Beef",
  "CakeSlice",
  "Candy",
  "ChefHat",
  "Croissant",
  "Drumstick",
  "Egg",
  "Fish",
  "GlassWater",
  "IceCream",
  "Milk",
  "Pizza",
  "Popcorn",
  "Salad",
  "Soup",
  "Wine",
  "Citrus",
  "Sandwich",
  "Martini",
  "Shell",
];

const ICON_MAP = {
  Grid2x2, CupSoda, UtensilsCrossed, Cookie, Snowflake,
  Flame, Coffee, Apple, Beef, CakeSlice,
  Candy, ChefHat, Croissant, Drumstick, Egg,
  Fish, GlassWater, IceCream, Milk, Pizza,
  Popcorn, Salad, Soup, Wine, Citrus,
  Sandwich, Martini, Shell,
};

export function renderIcon(name, size = 20, isFlat = false) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  
  if (isFlat) {
    // Flat modern design style
    return createElement(Icon, { 
      size, 
      strokeWidth: 2, 
      color: "currentColor",
      fill: "currentColor", 
      opacity: 0.85 
    });
  }
  
  return createElement(Icon, { size, strokeWidth: 1.5 });
}
