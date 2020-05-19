// @flow
import React, { useContext, useState, useRef, useEffect } from 'react'
import moment from 'moment'
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native'

import { COLORS, RATIO, SPACING } from '../styles'
import { newMessage } from '../data/useData'
import { db } from '../data/firebase'
import Context from '../context/'
import Text from './Text'
import Icon from './Icon'

type Props = {
  chatId: string,
}

const ChatView = (props: Props) => {
  const field = useRef<TextInput>()
  const { user } = useContext(Context)
  const id: string = user ? user.uid : '0'
  const [message, setMessage] = useState('')

  const [data, setData] = useState([])

  useEffect(() => {
    field && field.current && field.current.focus && field.current.focus()
  })

  useEffect(() => {
    return db
      .collection(`friendship/${props.chatId}/messages`)
      .orderBy('dateTime', 'desc')
      .onSnapshot(collection => {
        if (collection.size) {
          setData(
            collection.docs.map(item => ({
              id: item.id,
              ...item.data(),
            })),
          )
        } else {
          setData([])
        }
      })
  }, [props.chatId])

  const sendMessage = () => {
    if (message) {
      newMessage(props.chatId, message, id)
      setMessage('')
    }
  }

  const keyExtractor = (item: Object) => item.id

  const renderItem = ({ item }: { item: Object }) => {
    const containerStyle = [styles.messageContainer]
    const messageStyle = [styles.message]
    if (item.from === id) {
      containerStyle.push(styles.myMessageContainer)
      messageStyle.push(styles.myMessage)
    } else {
      containerStyle.push(styles.friendsMessageContainer)
      messageStyle.push(styles.friendsMessage)
    }

    return (
      <>
        <View style={containerStyle}>
          <Text style={messageStyle} color={COLORS.WHITE}>
            <Text size={10}>
              {moment(item.dateTime.seconds * 1000).format('lll')}
              {'\n'}
              {'\n'}
            </Text>

            {item.message}
          </Text>
        </View>
      </>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        inverted
        key={`messages-${data.length}`}
        keyboardShouldPersistTaps="handled"
        keyExtractor={keyExtractor}
        data={data}
        renderItem={renderItem}
        initialNumToRender={30}
        onScrollToIndexFailed={() => {}}
        getItemLayout={(data, index) => ({
          length: SPACING * 12,
          offset: SPACING * 12 * index,
          index,
        })}
      />

      <View style={styles.inputView}>
        <TextInput
          placeholder="Write your message"
          ref={field}
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={sendMessage}
          style={styles.input}
          autoFocus
        />
        {!!message && (
          <TouchableOpacity style={styles.button} onPress={sendMessage}>
            <Icon name="Send" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default ChatView

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.GREY7,
  },
  inputView: {
    flexDirection: 'row',
    paddingTop: SPACING * 4,
    paddingHorizontal: SPACING * 4,
    backgroundColor: COLORS.WHITE,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.GREY7,
    borderRadius: 3,
    fontSize: RATIO * 14,
    padding: SPACING * 4,
  },
  button: {
    paddingLeft: SPACING * 4,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING * 4,
    paddingVertical: SPACING * 2,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  message: {
    minWidth: 200,
    borderRadius: 3,
    padding: SPACING * 2,
    fontSize: RATIO * 14,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  myMessage: {
    backgroundColor: COLORS.PURPLE,
    justifyContent: 'flex-end',
  },
  friendsMessageContainer: {
    justifyContent: 'flex-start',
  },
  friendsMessage: {
    backgroundColor: COLORS.GREEN,
  },
})
