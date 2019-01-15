/**
  ******************************************************************************
  * @file    queue.h
  * @author  MCD Application Team
  * @brief   Header for queue.c
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

/* Define to prevent recursive inclusion -------------------------------------*/
#ifndef __UTIL_QUEUE_H
#define __UTIL_QUEUE_H

/* Includes ------------------------------------------------------------------*/
/* Exported types ------------------------------------------------------------*/

typedef struct{
    uint16_t queue_read_idx;          //read index in the queue
    uint16_t queue_write_idx;         //write index in the queue
    uint16_t queue_nb_element;//number of element in the queue
    uint16_t queue_size;      //size in bytes if the queue
    uint8_t* queue_buff;      //queue buffer pointer
    uint8_t  queue_full;      //manage when queue_write_idx is equel to read_idx after adding
} queue_param_t;


/* Exported constants --------------------------------------------------------*/
/* External variables --------------------------------------------------------*/
/* Exported macros -----------------------------------------------------------*/
/* Exported functions ------------------------------------------------------- */ 

/**
  * @brief   init circular queue with queue_buff and its queue_size
  * @param  queue: pointer on queue structure   to be handled
  * @param  queue_buff; pointer on element(s) to be added 
  * @param  queue_size:  of queue_buff in Bytes
  */
void circular_queue_init(queue_param_t* queue, uint8_t* queue_buff, uint16_t queue_size);

/**
  * @brief  queue_add the buff in the queue
  * @note   buff can be added in one element, or splitted in 2 elements when added at end of the queue buffer
  * @param  queue: pointer on queue structure to be handled
  * @param  buff the buffer to be added on the queue
  * @param  buff_size the size of buff to be added
  * @retval 0 when OK, return -1 when no space left
  */
int circular_queue_add(queue_param_t* queue, uint8_t* buff, uint16_t buff_size);

/**
  * @brief  queue_add the buff in the queue
  * @note   sense if elements are present in the queue
  * @param  queue: pointer on queue structure to be handled
  * @retval return 0 when element(s) in the queue, return -1 no element in the queue
  */
int circular_queue_sense(queue_param_t* queue);

/**
  * @brief  retreive head element from the queue 
  * @note   removes only one element
  * @param  queue: pointer on queue structure to be handled
  * @param  buff pointer on the head element retreived
  * @param  buff_size the size of head element
  * @retval return 0 when element in the queue, return -1 no element in the queue
  */
int circular_queue_get(queue_param_t* queue, uint8_t** buff, uint16_t* buff_size);

/**
  * @brief  remove head element from the queue 
  * @note   removes only one element
  * @param  queue: pointer on queue structure to be handled
  * @retval return 0 when element in the queue, return -1 no element in the queue
  */
int circular_queue_remove(queue_param_t* queue);

#endif //UTIL_QUEUE
