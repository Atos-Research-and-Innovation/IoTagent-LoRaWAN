/**
 ******************************************************************************
 * @file    x_nucleo_iks01a1_pressure.c
 * @author  MEMS Application Team
 * @version V3.0.0
 * @date    12-August-2016
 * @brief   This file provides a set of functions needed to manage the pressure sensor
 ******************************************************************************
 * @attention
 *
 * <h2><center>&copy; COPYRIGHT(c) 2016 STMicroelectronics</center></h2>
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *   1. Redistributions of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimer.
 *   2. Redistributions in binary form must reproduce the above copyright notice,
 *      this list of conditions and the following disclaimer in the documentation
 *      and/or other materials provided with the distribution.
 *   3. Neither the name of STMicroelectronics nor the names of its contributors
 *      may be used to endorse or promote products derived from this software
 *      without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 ******************************************************************************
 */

/* Includes ------------------------------------------------------------------*/
#include "x_nucleo_iks01a1_pressure.h"



/** @addtogroup BSP BSP
 * @{
 */

/** @addtogroup X_NUCLEO_IKS01A1 X_NUCLEO_IKS01A1
 * @{
 */

/** @addtogroup X_NUCLEO_IKS01A1_PRESSURE Pressure
 * @{
 */

/** @addtogroup X_NUCLEO_IKS01A1_PRESSURE_Private_Variables Private variables
 * @{
 */

static DrvContextTypeDef PRESSURE_SensorHandle[ PRESSURE_SENSORS_MAX_NUM ];
static PRESSURE_Data_t PRESSURE_Data[ PRESSURE_SENSORS_MAX_NUM ]; // Pressure - all.
static LPS25HB_P_Data_t LPS25HB_P_0_Data; // Pressure - sensor 0 LPS25H/B on board.
static LPS25HB_P_Data_t LPS25HB_P_1_Data; // Pressure - sensor 1 LPS25H/B via DIL24.
static LPS22HB_P_Data_t LPS22HB_P_0_Data; // Pressure - sensor 2 LPS22H/B via DIL24.

/**
 * @}
 */

/** @addtogroup X_NUCLEO_IKS01A1_PRESSURE_Private_FunctionPrototypes Private function prototypes
 * @{
 */

static DrvStatusTypeDef BSP_LPS25HB_PRESSURE_Init( int id, void **handle );
static DrvStatusTypeDef BSP_LPS22HB_PRESSURE_Init( void **handle );

/**
 * @}
 */

/** @addtogroup X_NUCLEO_IKS01A1_PRESSURE_Imported_Function_Prototypes Imported function prototypes
 * @{
 */

/* Sensor IO functions */
extern DrvStatusTypeDef Sensor_IO_Init( void );

/**
 * @}
 */

/** @addtogroup X_NUCLEO_IKS01A1_PRESSURE_Public_Functions Public functions
 * @{
 */

/**
 * @brief Initialize a pressure sensor
 * @param id the pressure sensor identifier
 * @param handle the device handle
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_Init( PRESSURE_ID_t id, void **handle )
{
  *handle = NULL;

  switch(id)
  {
    case PRESSURE_SENSORS_AUTO:
    default:
    {
      /* Try to init the LPS22HB DIL24 first */
      if( BSP_LPS22HB_PRESSURE_Init(handle) == COMPONENT_ERROR )
      {
        /* Try to init the LPS25H/B DIL24 if we do not use the LPS22HB DIL24 */
        if( BSP_LPS25HB_PRESSURE_Init(LPS25HB_P_1, handle) == COMPONENT_ERROR )
        {
          /* Try to init the LPS25H/B on board if we do not use the LPS25H/B DIL24 */
          if( BSP_LPS25HB_PRESSURE_Init(LPS25HB_P_0, handle) == COMPONENT_ERROR )
          {
            return COMPONENT_ERROR;
          }
        }
      }
      break;
    }
    case LPS25HB_P_0:
    {
      if( BSP_LPS25HB_PRESSURE_Init(LPS25HB_P_0, handle) == COMPONENT_ERROR )
      {
        return COMPONENT_ERROR;
      }
      break;
    }
    case LPS25HB_P_1:
    {
      if( BSP_LPS25HB_PRESSURE_Init(LPS25HB_P_1, handle) == COMPONENT_ERROR )
      {
        return COMPONENT_ERROR;
      }
      break;
    }
    case LPS22HB_P_0:
    {
      if( BSP_LPS22HB_PRESSURE_Init(handle) == COMPONENT_ERROR )
      {
        return COMPONENT_ERROR;
      }
      break;
    }
  }

  return COMPONENT_OK;
}


/**
 * @brief Initialize LPS25HB pressure sensor
 * @param id the pressure sensor identifier
 * @param handle the device handle
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
static DrvStatusTypeDef BSP_LPS25HB_PRESSURE_Init( int id, void **handle )
{
  PRESSURE_Drv_t *driver = NULL;

  if(PRESSURE_SensorHandle[ id ].isInitialized == 1)
  {
    /* We have reached the max num of instance for this component */
    return COMPONENT_ERROR;
  }

  if ( Sensor_IO_Init() == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  /* Setup sensor handle. */
  switch(id)
  {
    case LPS25HB_P_0:
      PRESSURE_SensorHandle[ LPS25HB_P_0 ].who_am_i      = LPS25HB_WHO_AM_I_VAL;
      PRESSURE_SensorHandle[ LPS25HB_P_0 ].address       = LPS25HB_ADDRESS_HIGH;
      PRESSURE_SensorHandle[ LPS25HB_P_0 ].instance      = LPS25HB_P_0;
      PRESSURE_SensorHandle[ LPS25HB_P_0 ].isInitialized = 0;
      PRESSURE_SensorHandle[ LPS25HB_P_0 ].isEnabled     = 0;
      PRESSURE_SensorHandle[ LPS25HB_P_0 ].isCombo       = 1;
      PRESSURE_SensorHandle[ LPS25HB_P_0 ].pData         = ( void * )&PRESSURE_Data[ LPS25HB_P_0 ];
      PRESSURE_SensorHandle[ LPS25HB_P_0 ].pVTable       = ( void * )&LPS25HB_P_Drv;
      PRESSURE_SensorHandle[ LPS25HB_P_0 ].pExtVTable    = 0;

      LPS25HB_P_0_Data.comboData = &LPS25HB_Combo_Data[0];
      PRESSURE_Data[ LPS25HB_P_0 ].pComponentData = ( void * )&LPS25HB_P_0_Data;
      PRESSURE_Data[ LPS25HB_P_0 ].pExtData       = 0;

      *handle = (void *)&PRESSURE_SensorHandle[ LPS25HB_P_0 ];
      break;
    case LPS25HB_P_1:
      PRESSURE_SensorHandle[ LPS25HB_P_1 ].who_am_i      = LPS25HB_WHO_AM_I_VAL;
      PRESSURE_SensorHandle[ LPS25HB_P_1 ].address       = LPS25HB_ADDRESS_LOW;
      PRESSURE_SensorHandle[ LPS25HB_P_1 ].instance      = LPS25HB_P_1;
      PRESSURE_SensorHandle[ LPS25HB_P_1 ].isInitialized = 0;
      PRESSURE_SensorHandle[ LPS25HB_P_1 ].isEnabled     = 0;
      PRESSURE_SensorHandle[ LPS25HB_P_1 ].isCombo       = 1;
      PRESSURE_SensorHandle[ LPS25HB_P_1 ].pData         = ( void * )&PRESSURE_Data[ LPS25HB_P_1 ];
      PRESSURE_SensorHandle[ LPS25HB_P_1 ].pVTable       = ( void * )&LPS25HB_P_Drv;
      PRESSURE_SensorHandle[ LPS25HB_P_1 ].pExtVTable    = 0;

      LPS25HB_P_1_Data.comboData = &LPS25HB_Combo_Data[1];
      PRESSURE_Data[ LPS25HB_P_1 ].pComponentData = ( void * )&LPS25HB_P_1_Data;
      PRESSURE_Data[ LPS25HB_P_1 ].pExtData       = 0;

      *handle = (void *)&PRESSURE_SensorHandle[ LPS25HB_P_1 ];
      break;
  }

  driver = ( PRESSURE_Drv_t * )((DrvContextTypeDef *)(*handle))->pVTable;

  if ( driver->Init == NULL )
  {
    memset((*handle), 0, sizeof(DrvContextTypeDef));
    *handle = NULL;
    return COMPONENT_ERROR;
  }

  if ( driver->Init( (DrvContextTypeDef *)(*handle) ) == COMPONENT_ERROR )
  {
    memset((*handle), 0, sizeof(DrvContextTypeDef));
    *handle = NULL;
    return COMPONENT_ERROR;
  }

  return COMPONENT_OK;
}


/**
 * @brief Initialize LPS22HB pressure sensor
 * @param handle the device handle
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
static DrvStatusTypeDef BSP_LPS22HB_PRESSURE_Init( void **handle )
{
  PRESSURE_Drv_t *driver = NULL;

  if(PRESSURE_SensorHandle[ LPS22HB_P_0 ].isInitialized == 1)
  {
    /* We have reached the max num of instance for this component */
    return COMPONENT_ERROR;
  }

  if ( Sensor_IO_Init() == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  /* Setup sensor handle. */
  PRESSURE_SensorHandle[ LPS22HB_P_0 ].who_am_i      = LPS22HB_WHO_AM_I_VAL;
  PRESSURE_SensorHandle[ LPS22HB_P_0 ].address       = LPS22HB_ADDRESS_LOW;
  PRESSURE_SensorHandle[ LPS22HB_P_0 ].instance      = LPS22HB_P_0;
  PRESSURE_SensorHandle[ LPS22HB_P_0 ].isInitialized = 0;
  PRESSURE_SensorHandle[ LPS22HB_P_0 ].isEnabled     = 0;
  PRESSURE_SensorHandle[ LPS22HB_P_0 ].isCombo       = 1;
  PRESSURE_SensorHandle[ LPS22HB_P_0 ].pData         = ( void * )&PRESSURE_Data[ LPS22HB_P_0 ];
  PRESSURE_SensorHandle[ LPS22HB_P_0 ].pVTable       = ( void * )&LPS22HB_P_Drv;
  PRESSURE_SensorHandle[ LPS22HB_P_0 ].pExtVTable    = ( void * )&LPS22HB_P_ExtDrv;

  LPS22HB_P_0_Data.comboData = &LPS22HB_Combo_Data[0];
  PRESSURE_Data[ LPS22HB_P_0 ].pComponentData = ( void * )&LPS22HB_P_0_Data;
  PRESSURE_Data[ LPS22HB_P_0 ].pExtData       = 0;

  *handle = (void *)&PRESSURE_SensorHandle[ LPS22HB_P_0 ];

  driver = ( PRESSURE_Drv_t * )((DrvContextTypeDef *)(*handle))->pVTable;

  if ( driver->Init == NULL )
  {
    memset((*handle), 0, sizeof(DrvContextTypeDef));
    *handle = NULL;
    return COMPONENT_ERROR;
  }

  if ( driver->Init( (DrvContextTypeDef *)(*handle) ) == COMPONENT_ERROR )
  {
    memset((*handle), 0, sizeof(DrvContextTypeDef));
    *handle = NULL;
    return COMPONENT_ERROR;
  }

  /* Configure interrupt lines for LPS22HB */
  LPS22HB_Sensor_IO_ITConfig();

  return COMPONENT_OK;
}


/**
 * @brief Deinitialize a pressure sensor
 * @param handle the device handle
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_DeInit( void **handle )
{
  DrvContextTypeDef *ctx = (DrvContextTypeDef *)(*handle);
  PRESSURE_Drv_t *driver = NULL;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  driver = ( PRESSURE_Drv_t * )ctx->pVTable;

  if ( driver->DeInit == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( driver->DeInit( ctx ) == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  memset(ctx, 0, sizeof(DrvContextTypeDef));

  *handle = NULL;

  return COMPONENT_OK;
}


/**
 * @brief Enable pressure sensor
 * @param handle the device handle
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_Sensor_Enable( void *handle )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;
  PRESSURE_Drv_t *driver = NULL;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  driver = ( PRESSURE_Drv_t * )ctx->pVTable;

  if ( driver->Sensor_Enable == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( driver->Sensor_Enable( ctx ) == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  return COMPONENT_OK;
}


/**
 * @brief Disable pressure sensor
 * @param handle the device handle
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_Sensor_Disable( void *handle )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;
  PRESSURE_Drv_t *driver = NULL;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  driver = ( PRESSURE_Drv_t * )ctx->pVTable;

  if ( driver->Sensor_Disable == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( driver->Sensor_Disable( ctx ) == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  return COMPONENT_OK;
}


/**
 * @brief Check if the pressure sensor is initialized
 * @param handle the device handle
 * @param status the pointer to the initialization status
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_IsInitialized( void *handle, uint8_t *status )
{
  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  if ( status == NULL )
  {
    return COMPONENT_ERROR;
  }

  *status = ctx->isInitialized;

  return COMPONENT_OK;
}


/**
 * @brief Check if the pressure sensor is enabled
 * @param handle the device handle
 * @param status the pointer to the enable status
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_IsEnabled( void *handle, uint8_t *status )
{
  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  if ( status == NULL )
  {
    return COMPONENT_ERROR;
  }

  *status = ctx->isEnabled;

  return COMPONENT_OK;
}


/**
 * @brief Check if the pressure sensor is combo
 * @param handle the device handle
 * @param status the pointer to the combo status
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_IsCombo( void *handle, uint8_t *status )
{
  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  if ( status == NULL )
  {
    return COMPONENT_ERROR;
  }

  *status = ctx->isCombo;

  return COMPONENT_OK;
}


/**
 * @brief Get the pressure sensor instance
 * @param handle the device handle
 * @param instance the pointer to the device instance
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_Get_Instance( void *handle, uint8_t *instance )
{
  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  if ( instance == NULL )
  {
    return COMPONENT_ERROR;
  }

  *instance = ctx->instance;

  return COMPONENT_OK;
}


/**
 * @brief Get the WHO_AM_I ID of the pressure sensor
 * @param handle the device handle
 * @param who_am_i pointer to the value of WHO_AM_I register
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_Get_WhoAmI( void *handle, uint8_t *who_am_i )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;
  PRESSURE_Drv_t *driver = NULL;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  driver = ( PRESSURE_Drv_t * )ctx->pVTable;

  if ( who_am_i == NULL )
  {
    return COMPONENT_ERROR;
  }
  if ( driver->Get_WhoAmI == NULL )
  {
    return COMPONENT_ERROR;
  }
  if ( driver->Get_WhoAmI( ctx, who_am_i ) == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  return COMPONENT_OK;
}


/**
 * @brief Check the WHO_AM_I ID of the pressure sensor
 * @param handle the device handle
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_Check_WhoAmI( void *handle )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;
  PRESSURE_Drv_t *driver = NULL;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  driver = ( PRESSURE_Drv_t * )ctx->pVTable;

  if ( driver->Check_WhoAmI == NULL )
  {
    return COMPONENT_ERROR;
  }
  if ( driver->Check_WhoAmI( ctx ) == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  return COMPONENT_OK;
}


/**
 * @brief Get the pressure value
 * @param handle the device handle
 * @param pressure pointer where the value is written [hPa]
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_Get_Press( void *handle, float *pressure )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;
  PRESSURE_Drv_t *driver = NULL;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  driver = ( PRESSURE_Drv_t * )ctx->pVTable;

  if ( pressure == NULL )
  {
    return COMPONENT_ERROR;
  }
  if ( driver->Get_Press == NULL )
  {
    return COMPONENT_ERROR;
  }
  if ( driver->Get_Press( ctx, pressure ) == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  return COMPONENT_OK;
}


/**
 * @brief Get the pressure sensor output data rate
 * @param handle the device handle
 * @param odr pointer where the output data rate is written
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_Get_ODR( void *handle, float *odr )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;
  PRESSURE_Drv_t *driver = NULL;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  driver = ( PRESSURE_Drv_t * )ctx->pVTable;

  if ( odr == NULL )
  {
    return COMPONENT_ERROR;
  }
  if ( driver->Get_ODR == NULL )
  {
    return COMPONENT_ERROR;
  }
  if ( driver->Get_ODR( ctx, odr ) == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  return COMPONENT_OK;
}


/**
 * @brief Set the pressure sensor output data rate
 * @param handle the device handle
 * @param odr the functional output data rate to be set
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_Set_ODR( void *handle, SensorOdr_t odr )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;
  PRESSURE_Drv_t *driver = NULL;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  driver = ( PRESSURE_Drv_t * )ctx->pVTable;

  if ( driver->Set_ODR == NULL )
  {
    return COMPONENT_ERROR;
  }
  if ( driver->Set_ODR( ctx, odr ) == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  return COMPONENT_OK;
}


/**
 * @brief Set the pressure sensor output data rate
 * @param handle the device handle
 * @param odr the output data rate value to be set
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_Set_ODR_Value( void *handle, float odr )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;
  PRESSURE_Drv_t *driver = NULL;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  driver = ( PRESSURE_Drv_t * )ctx->pVTable;

  if ( driver->Set_ODR_Value == NULL )
  {
    return COMPONENT_ERROR;
  }
  if ( driver->Set_ODR_Value( ctx, odr ) == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  return COMPONENT_OK;
}


/**
 * @brief Read the data from register
 * @param handle the device handle
 * @param reg register address
 * @param data register data
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_Read_Reg( void *handle, uint8_t reg, uint8_t *data )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;
  PRESSURE_Drv_t *driver = NULL;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  driver = ( PRESSURE_Drv_t * )ctx->pVTable;

  if(data == NULL)
  {
    return COMPONENT_ERROR;
  }

  if ( driver->Read_Reg == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( driver->Read_Reg( ctx, reg, data ) == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  return COMPONENT_OK;
}



/**
 * @brief Write the data to register
 * @param handle the device handle
 * @param reg register address
 * @param data register data
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_Write_Reg( void *handle, uint8_t reg, uint8_t data )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;
  PRESSURE_Drv_t *driver = NULL;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  driver = ( PRESSURE_Drv_t * )ctx->pVTable;

  if ( driver->Write_Reg == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( driver->Write_Reg( ctx, reg, data ) == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  return COMPONENT_OK;
}



/**
 * @brief Get pressure data ready status
 * @param handle the device handle
 * @param status the data ready status
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_Get_DRDY_Status( void *handle, uint8_t *status )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;
  PRESSURE_Drv_t *driver = NULL;

  if(ctx == NULL)
  {
    return COMPONENT_ERROR;
  }

  driver = ( PRESSURE_Drv_t * )ctx->pVTable;

  if ( driver->Get_DRDY_Status == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( driver->Get_DRDY_Status( ctx, status ) == COMPONENT_ERROR )
  {
    return COMPONENT_ERROR;
  }

  return COMPONENT_OK;
}



/**
 * @brief Get FIFO THR status (available only for LPS22HB sensor)
 * @param handle the device handle
 * @param *status FIFO THR status
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_FIFO_Get_Fth_Status_Ext( void *handle, uint8_t *status )
{
  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if ( ctx == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( ctx->pExtVTable == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( status == NULL )
  {
    return COMPONENT_ERROR;
  }

  /* At the moment this feature is only implemented for LPS22HB */
  if ( ctx->who_am_i == LPS22HB_WHO_AM_I_VAL )
  {
    LPS22HB_P_ExtDrv_t *extDriver = ( LPS22HB_P_ExtDrv_t * )ctx->pExtVTable;

    if ( extDriver->FIFO_Get_Fth_Status == NULL )
    {
      return COMPONENT_ERROR;
    }

    else
    {
      return extDriver->FIFO_Get_Fth_Status( ctx, status );
    }
  }

  else
  {
    return COMPONENT_ERROR;
  }
}



/**
 * @brief Get FIFO FULL status (available only for LPS22HB sensor)
 * @param handle the device handle
 * @param *status FIFO FULL status
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_FIFO_Get_Full_Status_Ext( void *handle, uint8_t *status )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if ( ctx == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( ctx->pExtVTable == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( status == NULL )
  {
    return COMPONENT_ERROR;
  }

  /* At the moment this feature is only implemented for LPS22HB */
  if ( ctx->who_am_i == LPS22HB_WHO_AM_I_VAL )
  {
    LPS22HB_P_ExtDrv_t *extDriver = ( LPS22HB_P_ExtDrv_t * )ctx->pExtVTable;

    if ( extDriver->FIFO_Get_Full_Status == NULL )
    {
      return COMPONENT_ERROR;
    }

    else
    {
      return extDriver->FIFO_Get_Full_Status( ctx, status );
    }
  }

  else
  {
    return COMPONENT_ERROR;
  }
}



/**
 * @brief Get FIFO OVR status (available only for LPS22HB sensor)
 * @param handle the device handle
 * @param *status FIFO OVR status
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_FIFO_Get_Ovr_Status_Ext( void *handle, uint8_t *status )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if ( ctx == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( ctx->pExtVTable == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( status == NULL )
  {
    return COMPONENT_ERROR;
  }

  /* At the moment this feature is only implemented for LPS22HB */
  if ( ctx->who_am_i == LPS22HB_WHO_AM_I_VAL )
  {
    LPS22HB_P_ExtDrv_t *extDriver = ( LPS22HB_P_ExtDrv_t * )ctx->pExtVTable;

    if ( extDriver->FIFO_Get_Ovr_Status == NULL )
    {
      return COMPONENT_ERROR;
    }

    else
    {
      return extDriver->FIFO_Get_Ovr_Status( ctx, status );
    }
  }

  else
  {
    return COMPONENT_ERROR;
  }
}



/**
 * @brief Get FIFO data (available only for LPS22HB sensor)
 * @param handle the device handle
 * @param *pressure pointer to FIFO pressure data
 * @param *temperature pointer to FIFO temperature data
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_FIFO_Get_Data_Ext( void *handle, float *pressure, float *temperature )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if ( ctx == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( ctx->pExtVTable == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( pressure == NULL || temperature == NULL )
  {
    return COMPONENT_ERROR;
  }

  /* At the moment this feature is only implemented for LPS22HB */
  if ( ctx->who_am_i == LPS22HB_WHO_AM_I_VAL )
  {
    LPS22HB_P_ExtDrv_t *extDriver = ( LPS22HB_P_ExtDrv_t * )ctx->pExtVTable;

    if ( extDriver->FIFO_Get_Data == NULL )
    {
      return COMPONENT_ERROR;
    }

    else
    {
      return extDriver->FIFO_Get_Data( ctx, pressure, temperature );
    }
  }

  else
  {
    return COMPONENT_ERROR;
  }
}



/**
 * @brief Get number of unread FIFO samples (available only for LPS22HB sensor)
 * @param handle the device handle
 * @param *nSamples Number of unread FIFO samples
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_FIFO_Get_Num_Of_Samples_Ext( void *handle, uint8_t *nSamples )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if ( ctx == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( ctx->pExtVTable == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( nSamples == NULL )
  {
    return COMPONENT_ERROR;
  }

  /* At the moment this feature is only implemented for LPS22HB */
  if ( ctx->who_am_i == LPS22HB_WHO_AM_I_VAL )
  {
    LPS22HB_P_ExtDrv_t *extDriver = ( LPS22HB_P_ExtDrv_t * )ctx->pExtVTable;

    if ( extDriver->FIFO_Get_Num_Of_Samples == NULL )
    {
      return COMPONENT_ERROR;
    }

    else
    {
      return extDriver->FIFO_Get_Num_Of_Samples( ctx, nSamples );
    }
  }

  else
  {
    return COMPONENT_ERROR;
  }
}



/**
 * @brief Set FIFO mode (available only for LPS22HB sensor)
 * @param handle the device handle
 * @param mode FIFO mode
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_FIFO_Set_Mode_Ext( void *handle, uint8_t mode )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if ( ctx == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( ctx->pExtVTable == NULL )
  {
    return COMPONENT_ERROR;
  }

  /* At the moment this feature is only implemented for LPS22HB */
  if ( ctx->who_am_i == LPS22HB_WHO_AM_I_VAL )
  {
    LPS22HB_P_ExtDrv_t *extDriver = ( LPS22HB_P_ExtDrv_t * )ctx->pExtVTable;

    if ( extDriver->FIFO_Set_Mode == NULL )
    {
      return COMPONENT_ERROR;
    }

    else
    {
      return extDriver->FIFO_Set_Mode( ctx, mode );
    }
  }

  else
  {
    return COMPONENT_ERROR;
  }
}



/**
 * @brief Set FIFO interrupt (available only for LPS22HB sensor)
 * @param handle the device handle
 * @param interrupt FIFO interrupt
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_FIFO_Set_Interrupt_Ext( void *handle, uint8_t interrupt )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if ( ctx == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( ctx->pExtVTable == NULL )
  {
    return COMPONENT_ERROR;
  }

  /* At the moment this feature is only implemented for LPS22HB */
  if ( ctx->who_am_i == LPS22HB_WHO_AM_I_VAL )
  {
    LPS22HB_P_ExtDrv_t *extDriver = ( LPS22HB_P_ExtDrv_t * )ctx->pExtVTable;

    if ( extDriver->FIFO_Set_Interrupt == NULL )
    {
      return COMPONENT_ERROR;
    }

    else
    {
      return extDriver->FIFO_Set_Interrupt( ctx, interrupt );
    }
  }

  else
  {
    return COMPONENT_ERROR;
  }
}



/**
 * @brief Set FIFO interrupt (available only for LPS22HB sensor)
 * @param handle the device handle
 * @param interrupt FIFO interrupt
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_FIFO_Reset_Interrupt_Ext( void *handle, uint8_t interrupt )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if ( ctx == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( ctx->pExtVTable == NULL )
  {
    return COMPONENT_ERROR;
  }

  /* At the moment this feature is only implemented for LPS22HB */
  if ( ctx->who_am_i == LPS22HB_WHO_AM_I_VAL )
  {
    LPS22HB_P_ExtDrv_t *extDriver = ( LPS22HB_P_ExtDrv_t * )ctx->pExtVTable;

    if ( extDriver->FIFO_Reset_Interrupt == NULL )
    {
      return COMPONENT_ERROR;
    }

    else
    {
      return extDriver->FIFO_Reset_Interrupt( ctx, interrupt );
    }
  }

  else
  {
    return COMPONENT_ERROR;
  }
}



/**
 * @brief Set FIFO watermark (available only for LPS22HB sensor)
 * @param handle the device handle
 * @param watermark FIFO watermark
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_FIFO_Set_Watermark_Level_Ext( void *handle, uint8_t watermark )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if ( ctx == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( ctx->pExtVTable == NULL )
  {
    return COMPONENT_ERROR;
  }

  /* At the moment this feature is only implemented for LPS22HB */
  if ( ctx->who_am_i == LPS22HB_WHO_AM_I_VAL )
  {
    LPS22HB_P_ExtDrv_t *extDriver = ( LPS22HB_P_ExtDrv_t * )ctx->pExtVTable;

    if ( extDriver->FIFO_Set_Watermark_Level == NULL )
    {
      return COMPONENT_ERROR;
    }

    else
    {
      return extDriver->FIFO_Set_Watermark_Level( ctx, watermark );
    }
  }

  else
  {
    return COMPONENT_ERROR;
  }
}



/**
 * @brief Set FIFO to stop on FTH (available only for LPS22HB sensor)
 * @param handle the device handle
 * @param status enable or disable stopping on FTH interrupt
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_FIFO_Stop_On_Fth_Ext( void *handle, uint8_t status )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if ( ctx == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( ctx->pExtVTable == NULL )
  {
    return COMPONENT_ERROR;
  }

  /* At the moment this feature is only implemented for LPS22HB */
  if ( ctx->who_am_i == LPS22HB_WHO_AM_I_VAL )
  {
    LPS22HB_P_ExtDrv_t *extDriver = ( LPS22HB_P_ExtDrv_t * )ctx->pExtVTable;

    if ( extDriver->FIFO_Stop_On_Fth == NULL )
    {
      return COMPONENT_ERROR;
    }

    else
    {
      return extDriver->FIFO_Stop_On_Fth( ctx, status );
    }
  }

  else
  {
    return COMPONENT_ERROR;
  }
}



/**
 * @brief FIFO usage (available only for LPS22HB sensor)
 * @param handle the device handle
 * @param status enable or disable FIFO
 * @retval COMPONENT_OK in case of success
 * @retval COMPONENT_ERROR in case of failure
 */
DrvStatusTypeDef BSP_PRESSURE_FIFO_Usage_Ext( void *handle, uint8_t status )
{

  DrvContextTypeDef *ctx = (DrvContextTypeDef *)handle;

  if ( ctx == NULL )
  {
    return COMPONENT_ERROR;
  }

  if ( ctx->pExtVTable == NULL )
  {
    return COMPONENT_ERROR;
  }

  /* At the moment this feature is only implemented for LPS22HB */
  if ( ctx->who_am_i == LPS22HB_WHO_AM_I_VAL )
  {
    LPS22HB_P_ExtDrv_t *extDriver = ( LPS22HB_P_ExtDrv_t * )ctx->pExtVTable;

    if ( extDriver->FIFO_Usage == NULL )
    {
      return COMPONENT_ERROR;
    }

    else
    {
      return extDriver->FIFO_Usage( ctx, status );
    }
  }

  else
  {
    return COMPONENT_ERROR;
  }
}

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

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
