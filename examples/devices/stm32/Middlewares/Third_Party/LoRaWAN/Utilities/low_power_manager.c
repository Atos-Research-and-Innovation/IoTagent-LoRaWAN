/**
  ******************************************************************************
  * @file    low_power_manager.c
  * @author  MCD Application Team
  * @brief   Low Power Manager
  ******************************************************************************
  * @attention
  *
  * <h2><center>&copy; Copyright (c) 2018 STMicroelectronics.
  * All rights reserved.</center></h2>
  *
  * This software component is licensed by ST under Ultimate Liberty license
  * SLA0044, the "License"; You may not use this file except in compliance with
  * the License. You may obtain a copy of the License at:
  *                             www.st.com/SLA0044
  *
  ******************************************************************************
  */

/* Includes ------------------------------------------------------------------*/
#include "hw.h"
#include "low_power_manager.h"

/* Private typedef -----------------------------------------------------------*/
/* Private defines -----------------------------------------------------------*/
/* Private macros ------------------------------------------------------------*/
/* Private variables ---------------------------------------------------------*/
static uint32_t StopModeDisable = 0;
static uint32_t OffModeDisable = 0;

/* Global variables ----------------------------------------------------------*/
/* Private function prototypes -----------------------------------------------*/
/* Functions Definition ------------------------------------------------------*/
void LPM_SetOffMode(LPM_Id_t id, LPM_SetMode_t mode)
{
  BACKUP_PRIMASK();
  
  DISABLE_IRQ( );
  
  
  switch(mode)
  {
    case LPM_Disable:
    {
      OffModeDisable |= (uint32_t)id;
      break;
    }
    case LPM_Enable:
    {
      OffModeDisable &= ~(uint32_t)id;
      break;
    }
    default:
      break;
  }
  
  RESTORE_PRIMASK( );

  return;
}

void LPM_SetStopMode(LPM_Id_t id, LPM_SetMode_t mode)
{
  BACKUP_PRIMASK();
  
  DISABLE_IRQ( );
  
  
  switch(mode)
  {
    case LPM_Disable:
    {
      StopModeDisable |= (uint32_t)id;
      break;
    }
    case LPM_Enable:
    {
      StopModeDisable &= ~(uint32_t)id;
      break;
    }
    default:
      break;
  }
  RESTORE_PRIMASK( );

  return;
}

void LPM_EnterLowPower(void)
{
  if( StopModeDisable )
  {
    /**
     * SLEEP mode is required
     */
    LPM_EnterSleepMode();
    LPM_ExitSleepMode();
  }
  else
  { 
    if( OffModeDisable )
    {
      /**
       * STOP mode is required
       */
      LPM_EnterStopMode();
      LPM_ExitStopMode();
    }
    else
    {
      /**
       * OFF mode is required
       */
      LPM_EnterOffMode();
      LPM_ExitOffMode();
    }
  }

  return;
}

LPM_GetMode_t LPM_GetMode(void)
{
  LPM_GetMode_t mode_selected;

  BACKUP_PRIMASK();
  
  DISABLE_IRQ( );

  if(StopModeDisable )
  {
    mode_selected = LPM_SleepMode;
  }
  else
  {
    if(OffModeDisable)
    {
      mode_selected = LPM_StopMode;
    }
    else
    {
      mode_selected = LPM_OffMode;
    }
  }

  RESTORE_PRIMASK( );

  return mode_selected;
}

__weak void LPM_EnterSleepMode(void) {}
__weak void LPM_ExitSleepMode(void) {}
__weak void LPM_EnterStopMode(void) {}
__weak void LPM_ExitStopMode(void) {}
__weak void LPM_EnterOffMode(void) {}
__weak void LPM_ExitOffMode(void) {}


/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
