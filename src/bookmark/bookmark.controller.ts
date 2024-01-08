import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Bookmark as BookmarkModel } from '@prisma/client';

import { JwtGuard } from 'auth/guard';
import { GetUser } from 'auth/decorator';

import { BookmarkService } from './bookmark.service';

import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('api/bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post()
  createBookmark(
    @GetUser('id') userId: string,
    @Body() dto: CreateBookmarkDto
  ): Promise<BookmarkModel> {
    return this.bookmarkService.createBookmark(userId, dto);
  }

  @Patch(':id')
  editBookmarkById(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: EditBookmarkDto
  ): Promise<BookmarkModel> {
    return this.bookmarkService.editBookmarkById(userId, bookmarkId, dto);
  }

  @Get()
  getBookmarks(@GetUser('id') userId: string): Promise<BookmarkModel[]> {
    return this.bookmarkService.getBookmarks(userId);
  }

  @Get(':id')
  getBookmarkById(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) bookmarkId: number
  ): Promise<BookmarkModel> {
    return this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') userId: string,
    @Param('id', ParseIntPipe) bookmarkId: number
  ): Promise<BookmarkModel> {
    return this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
  }
}
