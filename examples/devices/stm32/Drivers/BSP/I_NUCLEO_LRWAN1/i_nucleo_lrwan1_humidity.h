/**
  ******************************************************************************
  * @file    i_nucleo_lrwan1_humidity.h
  * @author  MEMS Application Team
  * @brief   This file contains definitions for i_nucleo_lrwan1_humidity.c
  ******************************************************************************
  * @attention
  *
  * <h2><center>&copy; Copyright (c) 2018 STMicroelectronics.
  * All rights reserved.</center></h2>
  *
  * This software component is licensed by ST under BSD 3-Clause license,
  * the "License"; You may not use this file except in compliance with the
  * License. You may obtain a copy of the License at:
  *                        opensource.org/licenses/BSD-3-Clause
  *
  ******************************************************************************
  */

/* Define to prevent recursive inclusion -------------------------------------*/
#ifndef __I_NUCLEO_LRWAN1_HUMIDITY_H
#define __I_NUCLEO_LRWAN1_HUMIDITY_H

#ifdef __cplusplus
extern "C" {
#endif



/* Includes ------------------------------------------------------------------*/
#include "HTS221_Driver_HL.h"
#include "i_nucleo_lrwan1.h"


/** @addtogroup BSP BSP
 * @{
 */

/** @addtogroup I_NUCLEO_LRWAN1 I_NUCLEO_LRWAN1
 * @{
 */

/** @addtogroup I_NUCLEO_LRWAN1_HUMIDITY Humidity
 * @{
 */

/** @addtogroup I_NUCLEO_LRWAN1_HUMIDITY_Public_Types Public types
  * @{
  */

typedef enum
{
  HUMIDITY_SENSORS_AUTO = -1,    /* Always first element and equal to -1 */
  HTS221_H_0                     /* Default on board. */
} HUMIDITY_ID_t;

/**
 * @}
 */

/** @addtogroup I_NUCLEO_LRWAN1_HUMIDITY_Public_Defines Public defines
  * @{
  */

#define HUMIDITY_SENSORS_MAX_NUM 1

/**
 * @}
 */

/** @addtogroup I_NUCLEO_LRWAN1_HUMIDITY_Public_Function_Prototypes Public function prototypes
 * @{
 */

/* Sensor Configuration Functions */
DrvStatusTypeDef BSP_HUMIDITY_Init( HUMIDITY_ID_t id, void **handle );
DrvStatusTypeDef BSP_HUMIDITY_DeInit( void **handle );
DrvStatusTypeDef BSP_HUMIDITY_Sensor_Enable( void *handle );
DrvStatusTypeDef BSP_HUMIDITY_Sensor_Disable( void *handle );
DrvStatusTypeDef BSP_HUMIDITY_IsInitialized( void *handle, uint8_t *status );
DrvStatusTypeDef BSP_HUMIDITY_IsEnabled( void *handle, uint8_t *status );
DrvStatusTypeDef BSP_HUMIDITY_IsCombo( void *handle, uint8_t *status );
DrvStatusTypeDef BSP_HUMIDITY_Get_Instance( void *handle, uint8_t *instance );
DrvStatusTypeDef BSP_HUMIDITY_Get_WhoAmI( void *handle, uint8_t *who_am_i );
DrvStatusTypeDef BSP_HUMIDITY_Check_WhoAmI( void *handle );
DrvStatusTypeDef BSP_HUMIDITY_Get_Hum( void *handle, float *humidity );
DrvStatusTypeDef BSP_HUMIDITY_Get_ODR( void *handle, float *odr );
DrvStatusTypeDef BSP_HUMIDITY_Set_ODR( void *handle, SensorOdr_t odr );
DrvStatusTypeDef BSP_HUMIDITY_Set_ODR_Value( void *handle, float odr );
DrvStatusTypeDef BSP_HUMIDITY_Read_Reg( void *handle, uint8_t reg, uint8_t *data );
DrvStatusTypeDef BSP_HUMIDITY_Write_Reg( void *handle, uint8_t reg, uint8_t data );
DrvStatusTypeDef BSP_HUMIDITY_Get_DRDY_Status( void *handle, uint8_t *status );

/**
 * @}
 */

/**
 * @}
 */

/**
 * @}
 */

/**
 * @}
 */

#ifdef __cplusplus
}
#endif

#endif /* __I_NUCLEO_LRWAN1_HUMIDITY_H */

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
