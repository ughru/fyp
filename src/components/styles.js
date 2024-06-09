import React from 'react';
import { StyleSheet } from 'react-native';

// Style Definitions
const styles = StyleSheet.create({
    container: {
        /*
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 900,
        */
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    iconContainer: {
        position: 'absolute',
        marginRight: 8,
    },
    calendarContainer: {
        position: 'absolute',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    buttonContainer: {
        position: 'absolute',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      },
    textTitle: {
        position: 'absolute',
        fontSize: 24,
        fontWeight: 'bold'
    },
    pageTitle: {
        position: 'absolute',
        fontSize: 30,
        fontWeight: 'bold',
    },
    // eg (Personalisation, AccountType)
    // sub title in pages (Settings)
    questionText: {
        position: 'absolute',
        fontSize: 20,
        fontWeight: 'bold',
    },
    // text below title (eg in Register, Login)
    titleNote: {
        position: 'absolute',
        fontSize: 16,
        color: '#979595',
    },
    button: {
        position: 'absolute',
        width: 170,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: '#E3C2D7',
    },
    button2: {
        position: 'absolute',
        width: 300,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: '#C2C7E3',
    },
    button3: {
        position: 'absolute',
        width: 100,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: '#E3C2D7',
    },
    button4: {
        position: 'absolute',
        width: 320,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: '#E3C2D7',
    },
    button5: {
        position: 'absolute',
        width: 270,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: '#E3C2D7',
    },
    button6: {
        position: 'absolute',
        width: 80,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: '#E3C2D7',
    },
    button7: {
        position: 'absolute',
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: '#d470af',
    },
    button8: {
        position: 'absolute',
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: '#E3C2D7',
    },
    defaultButton: {
        borderColor: '#E3C2D7',
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    buttonPosition: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        position:'absolute',
        width: 320,
        height: 40,
        padding: 10,
        backgroundColor: '#D9D9D9',
    },
    input2: {
        position:'absolute',
        width: 240,
        height: 30,
        padding: 10,
        borderWidth: 1,
    },
    input3: {
        position:'absolute',
        width: 340,
        height: 40,
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#979595', 
    },
    imgButton: {
        position: 'absolute',
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        borderWidth: 1,
    },
    selectedImgButton: {
        position: 'absolute',
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        borderWidth: 1,
        backgroundColor: '#D39FC0',
    },
    text: {
        position: 'absolute',
        fontSize: 16,
    },
    // text in small button with icon >
    text2: {
        fontSize: 16,
        marginRight: 5,
    },
    // input box text
    formText: {
        position: 'absolute',
        fontSize: 16,
        color: '#979595',
    },
    // for text that are buttons
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6BB4DE',
    },
    // for error message
    error: {
        color: 'red',
    },
    date: {
        position: 'absolute',
        fontSize: 20,
        color: '#979595',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '94%',
        marginBottom: 20,
    },
    dayLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        width: 30,
        textAlign: 'center',
    },
    days: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '94%',
    },
    date2: {
        fontSize: 16,
        width: 30,
        textAlign: 'center',
    },
    currentDate: {
        color: '#d470af',
        fontWeight: "bold",
    },
    textInputWithIcon: {
        paddingLeft: 40, 
    },
    textInputWithIcon2: {
        paddingLeft: 60, 
    },
    search: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
      },
      categoryBtnActive: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E3C2D7",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
      },
      categoryBtnTxt: {
        marginLeft: 5,
        color: "black",
      },
      resourceBtn: {
        borderWidth: 1,
        width: 100,
        height: 150,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 10,
      },
      resourceInfo: {
        position: 'absolute',
      },
      resourceCategoryButton: {
        position: 'absolute',
        width: 170,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        borderRadius: 20,
        backgroundColor: '#E3C2D7',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    },
    forumDescStyle: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        marginBottom: 10,
        width: '100%'
    },
    modalButton: {
        backgroundColor: '#eee',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
        marginTop: 10
    },
    modalButtonText: {
        fontWeight: 'bold'
    },
    forumDescriptionBox: {
        width: '100%',
        marginTop: 10
    },
    forumPostContainer: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 15,
        borderColor: '#ddd',
        borderWidth: 1
    },
    forumPostID: {
        fontWeight: 'bold',
        fontSize: 15,
        color: 'black',
        margin: 10
    },
    forumPostUser: {
        fontWeight: 'bold',
        fontSize: 15,
        color: 'black',
        margin: 10,
        flex: 1
    },
    forumPostDescription: {
        fontWeight: 'bold',
        fontSize: 15,
        margin: 10
    },
    forumPostDate: {
        padding: 5,
        fontSize: 13,
        color: 'grey',

    },
    commentsIcon: {
        margin: 10,
        color: 'grey'
    },
    commentCount: {
        marginLeft: 1,
        color: 'grey'
    },
    commentsContainer: {
        padding: 10,
        marginTop: 100
    },
    reportForumButton: {
        backgroundColor: '#D22B2B',
        borderWidth: 0,
        borderRadius: 10,
        padding: 8,
        marginLeft: 100
    },
    reportForumPost: {
        fontWeight: 'bold',
        color: '#fff'
    },
    forumRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    threeDotVert: {
        padding: 15,
        alignSelf: 'flex-end'
    },
    adImageContainer: {
        marginTop: 100,
        padding: 10
    },
    adImage: {
        width: 300,
        height: 250,
        resizeMode: 'stretch'
    },
    sortForumContainer: {
        flexDirection: 'row',
        padding: 5,
        alignItems: 'center',
        marginRight: 120,
    },
    addForumComment: {
        flexDirection: 'row',
        borderRadius: 30,
        backgroundColor: '#ddd'
    },
    uploadCommentButton: {
        padding: 20,
        alignSelf: 'flex-end',
        
    },
    addCommentInput: {
        padding: 10,
        flex: 1
    }
  });


  export default styles;