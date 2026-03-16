#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <qpushbutton.h>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    connect(ui->pushButton, &QPushButton::clicked, this,&MainWindow::onButtonClick);
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::onButtonClick()
{
    static int button_click_times = 0;
    button_click_times++;
    ui->pushButton->setText("You have Clicked Me for " + QString::number(button_click_times) + "times");
}