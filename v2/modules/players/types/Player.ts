export interface Player {
  id: number;
  code: number;
  firstName: string;
  secondName: string;
  webName: string;
  teamName: string;
  teamNameShort: string;
  position: number;
  image: string;
  imageLarge: string;
  status: string;
  news: string;
  web_name?: string;
  first_name?: string;
  second_name?: string;
  element_type?: number;
  team?: number;
  now_cost?: number;
  cost_change_start_fall?: number;
}
