// The list of every region, in the order shown on the Home screen.
// To add a region's content, fill in the "items" list in its own file.

import type { Region } from '../types'
import { eastAsia } from './east-asia'
import { africa } from './africa'
import { southeastAsiaOceania } from './southeast-asia-oceania'
import { easternEurope } from './eastern-europe'
import { middleEastNorthAfrica } from './middle-east-north-africa'
import { latinAmerica } from './latin-america'
import { northAmerica } from './north-america'
import { southAsia } from './south-asia'

export const regions: Region[] = [
  eastAsia,
  africa,
  southeastAsiaOceania,
  easternEurope,
  middleEastNorthAfrica,
  latinAmerica,
  northAmerica,
  southAsia,
]
