/**
  ******************************************************************************
  * @file    queue.c
  * @author  MCD Application Team
  * @brief   Queue management
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
#include <stdint.h>
#include "queue.h"
/* Private define ------------------------------------------------------------*/
#define ELEMENT_SIZE_LEN 2
/* Private typedef -----------------------------------------------------------*/
/* Private macro -------------------------------------------------------------*/
/* Private function prototypes -----------------------------------------------*/
static void queue_copy(uint8_t* out, const uint8_t* in, uint16_t size);
static int16_t circular_queue_get_free_size(queue_param_t* queue);
static void add_elementSize_and_inc_writeIdx(queue_param_t* queue,uint16_t element_size);

/* Public functions ----------------------------------------------------------*/
void circular_queue_init(queue_param_t* queue, uint8_t* queue_buff, uint16_t queue_size)
{
  queue->queue_read_idx=0;
  queue->queue_write_idx=0;
  queue->queue_nb_element=0;
  queue->queue_buff=queue_buff;
  queue->queue_size=queue_size;
  queue->queue_full=0;
}

int circular_queue_add(queue_param_t* queue, uint8_t* buff, uint16_t buff_size)
{
  int status;  
  int16_t free_buff_len=circular_queue_get_free_size(queue);
  
  if ((buff_size+ELEMENT_SIZE_LEN<=free_buff_len)&& 
      ((queue->queue_write_idx+buff_size+ELEMENT_SIZE_LEN<=queue->queue_size) 
        || (queue->queue_write_idx>=queue->queue_size-ELEMENT_SIZE_LEN))) /*elementSize cut in 2 or elementSize at Top*/
  {
    //add in one element
    add_elementSize_and_inc_writeIdx(queue, buff_size);
    queue_copy(queue->queue_buff+queue->queue_write_idx,buff,buff_size);
    queue->queue_write_idx+=buff_size;
    /*modulo queue_size*/
    if (queue->queue_write_idx==queue->queue_size)
    {
        queue->queue_write_idx=0;
    }
    //add one element
    queue->queue_nb_element++; 
    /*in case que is full*/
    if (queue->queue_write_idx== queue->queue_read_idx)
    {
      queue->queue_full=1;
    }
    status=0;
  }
  else if (buff_size+2*ELEMENT_SIZE_LEN<=free_buff_len)
  {
    //split buffer in two elements
    /*fill top of queue with first element of size top_size*/
    uint16_t top_size = queue->queue_size-(queue->queue_write_idx+ELEMENT_SIZE_LEN);
    add_elementSize_and_inc_writeIdx(queue,top_size);
    queue_copy(queue->queue_buff+queue->queue_write_idx,buff,top_size);
    queue->queue_write_idx=0;

    /*fill bottom of queue with second element of size buff_size-top_size*/
    buff_size-=top_size;
    add_elementSize_and_inc_writeIdx(queue, buff_size);
    queue_copy(queue->queue_buff+queue->queue_write_idx,buff+top_size,buff_size);
    queue->queue_write_idx+=buff_size;
    // add two elements
    queue->queue_nb_element+=2;
    /*in case que is full*/
    if (queue->queue_write_idx== queue->queue_read_idx)
    {
      queue->queue_full=1;
    }    
    status =0;
  }
  else
  {
    status=-1;
  }
  return status;
}

int circular_queue_get(queue_param_t* queue, uint8_t** buff, uint16_t* buff_size)
{
  int status;
  if (queue->queue_nb_element==0)
  {
    status=-1;
  }
  else
  {
    uint16_t size;
    uint16_t read_idx=queue->queue_read_idx;
    /*retreive and remove 1st element' size and content*/
    size=(uint16_t) queue->queue_buff[read_idx++]<<8;
    /*wrap if needed*/
    if (read_idx==queue->queue_size)
    {
      read_idx=0;
    }
    size|=(uint16_t) queue->queue_buff[read_idx++];
    /*wrap if needed*/
    if (read_idx==queue->queue_size)
    {
      read_idx=0;
    }
    *buff= queue->queue_buff+read_idx;

    * buff_size=size;
    status=0;
  }
  return status;
}

int circular_queue_remove(queue_param_t* queue)
{
  int status;
  if (queue->queue_nb_element==0)
  {
      status=-1;
  }
  else
  {
    uint16_t size;
    /*retreive and remove 1st element' size and content*/
    size=(uint16_t) queue->queue_buff[queue->queue_read_idx++]<<8;
    if (queue->queue_read_idx==queue->queue_size)
    {
      queue->queue_read_idx=0;
    }
    size|=(uint16_t) queue->queue_buff[queue->queue_read_idx++];
    if (queue->queue_read_idx==queue->queue_size)
    {
      queue->queue_read_idx=0;
    }
    /* increment read index*/
    queue->queue_read_idx+=size;
    /*modulo queue_size*/
    if (queue->queue_read_idx==queue->queue_size)
    {
        queue->queue_read_idx=0;
    }
    /* decrement number of element*/
    queue->queue_nb_element--;
    queue->queue_full=0;
    status=0;
  }
  return status;
}

int circular_queue_sense(queue_param_t* queue)
{
  int status;
  if (queue->queue_nb_element==0)
  {
    status=-1;
  }
  else
  {
    status=0;
  }
  return status;
}

/* Private functions ---------------------------------------------------------*/
static int16_t circular_queue_get_free_size(queue_param_t* queue)
{
  int16_t free_size;
  if (queue->queue_write_idx>=queue->queue_read_idx)
  {
    free_size=queue->queue_size-(queue->queue_write_idx-queue->queue_read_idx); 
  }
  else
  {
    free_size=(queue->queue_read_idx-queue->queue_write_idx); 
  }
  if ( queue->queue_full==1)
  {
    free_size=0;
  }
  return free_size;
}

static void queue_copy(uint8_t* out, const uint8_t* in, uint16_t size)
{
  while(size--)
  {
    *out++= *in++;
  }
}

static void add_elementSize_and_inc_writeIdx(queue_param_t* queue,uint16_t element_size)
{
  queue->queue_buff[queue->queue_write_idx++]=(uint8_t) (element_size>>8);
  /*wrap if needed*/
  if ( queue->queue_write_idx == queue->queue_size)
  {
    queue->queue_write_idx=0;
  }
  queue->queue_buff[queue->queue_write_idx++]=(uint8_t) (element_size);
  /*wrap if needed*/
  if ( queue->queue_write_idx == queue->queue_size)
  {
    queue->queue_write_idx=0;
  }
}

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
